from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class SalesPoint(BaseModel):
    day: str
    revenue: float


class PredictRequest(BaseModel):
    sales_history: List[SalesPoint]
    forecast_days: int = 7


class InfluencerPoint(BaseModel):
    name: str
    referral_code: str
    total_clicks: int
    revenue: float
    sales_count: int
    day_of_week: Optional[float] = None


class InsightsRequest(BaseModel):
    sales_history: List[SalesPoint]
    influencer_data: List[InfluencerPoint]


@app.post("/predict")
def predict_sales(req: PredictRequest):
    if len(req.sales_history) < 3:
        # Not enough data — return flat forecast
        avg = sum(p.revenue for p in req.sales_history) / max(len(req.sales_history), 1)
        forecast = [
            {"date": (datetime.today() + timedelta(days=i+1)).strftime("%Y-%m-%d"), "predicted_revenue": round(avg, 2)}
            for i in range(req.forecast_days)
        ]
        return {"forecast": forecast, "method": "average_fallback"}

    df = pd.DataFrame([{"day": p.day, "revenue": p.revenue} for p in req.sales_history])
    df["day"] = pd.to_datetime(df["day"])
    df = df.sort_values("day").set_index("day")
    df = df.resample("D").sum().fillna(0)

    # Simple linear regression on day index
    X = np.arange(len(df)).reshape(-1, 1)
    y = df["revenue"].values
    coeffs = np.polyfit(X.flatten(), y, deg=min(2, len(X) - 1))
    poly = np.poly1d(coeffs)

    last_idx = len(df)
    forecast = []
    for i in range(req.forecast_days):
        date = (df.index[-1] + timedelta(days=i+1)).strftime("%Y-%m-%d")
        predicted = max(0, float(poly(last_idx + i)))
        # Add slight weekly seasonality
        dow = (df.index[-1] + timedelta(days=i+1)).weekday()
        seasonal_factor = 1.15 if dow in [4, 5] else 0.95 if dow == 0 else 1.0
        forecast.append({"date": date, "predicted_revenue": round(predicted * seasonal_factor, 2)})

    return {"forecast": forecast, "method": "polynomial_regression"}


@app.post("/insights")
def generate_insights(req: InsightsRequest):
    # Build summary for OpenAI
    influencer_summary = []
    seen = {}
    for inf in req.influencer_data:
        if inf.name not in seen:
            seen[inf.name] = {"name": inf.name, "clicks": inf.total_clicks, "revenue": inf.revenue, "sales": inf.sales_count, "days": []}
        if inf.day_of_week is not None:
            seen[inf.name]["days"].append(int(inf.day_of_week))

    for name, data in seen.items():
        conv = round((data["sales"] / data["clicks"] * 100), 1) if data["clicks"] > 0 else 0
        best_day = max(set(data["days"]), key=data["days"].count) if data["days"] else None
        day_names = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        influencer_summary.append({
            "name": name,
            "clicks": data["clicks"],
            "revenue": data["revenue"],
            "conversion_rate": conv,
            "best_day": day_names[best_day] if best_day is not None else "N/A"
        })

    total_revenue = sum(p.revenue for p in req.sales_history)
    avg_daily = total_revenue / max(len(req.sales_history), 1)

    prompt = f"""You are an analytics AI for an influencer affiliate platform. Analyze this data and return 4-6 concise, actionable insights.

Influencer Performance:
{influencer_summary}

Overall: Total Revenue ₹{total_revenue:.2f}, Avg Daily Revenue ₹{avg_daily:.2f}

Return a JSON array of insights with this structure:
[{{"type": "positive"|"warning"|"info", "message": "insight text"}}]

Focus on: conversion rates, best performing days, low conversion despite high clicks, revenue concentration risk, growth opportunities.
Return ONLY the JSON array, no other text."""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=600
        )
        import json
        insights = json.loads(response.choices[0].message.content)
        return {"insights": insights, "source": "openai"}
    except Exception as e:
        # Fallback: rule-based insights
        insights = _rule_based_insights(influencer_summary, avg_daily)
        return {"insights": insights, "source": "rule_based", "note": str(e)}


def _rule_based_insights(influencers, avg_daily):
    insights = []
    for inf in influencers:
        if inf["clicks"] > 100 and inf["conversion_rate"] < 2:
            insights.append({"type": "warning", "message": f"{inf['name']} has {inf['clicks']} clicks but only {inf['conversion_rate']}% conversion — review landing page or offer relevance."})
        if inf["conversion_rate"] > 10:
            insights.append({"type": "positive", "message": f"{inf['name']} has an excellent {inf['conversion_rate']}% conversion rate — consider increasing their commission to retain them."})
        if inf["best_day"] in ["Saturday", "Sunday"]:
            insights.append({"type": "info", "message": f"{inf['name']} performs best on {inf['best_day']}s — schedule campaigns accordingly."})

    if len(influencers) > 1:
        top = max(influencers, key=lambda x: x["revenue"])
        top_share = top["revenue"] / max(sum(i["revenue"] for i in influencers), 1) * 100
        if top_share > 60:
            insights.append({"type": "warning", "message": f"Revenue is concentrated — {top['name']} drives {top_share:.0f}% of total revenue. Diversify your influencer portfolio."})

    if avg_daily > 0:
        insights.append({"type": "info", "message": f"Average daily revenue is ₹{avg_daily:.2f}. Projected monthly revenue: ₹{avg_daily * 30:.2f}."})

    return insights or [{"type": "info", "message": "Not enough data to generate insights yet. Record more sales to unlock AI analysis."}]


@app.get("/health")
def health():
    return {"status": "ok"}
