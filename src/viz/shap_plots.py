"""
MindBridge — SHAP Visualization Utilities
Plotly-based waterfall and summary charts for SHAP values.
"""

import plotly.graph_objects as go
import plotly.express as px
import numpy as np
from typing import List, Dict, Any


def waterfall_chart(top_factors: List[Dict[str, Any]], base_value: float, predicted_score: float) -> go.Figure:
    """
    Plotly waterfall/horizontal-bar chart showing SHAP contributions.

    Parameters
    ----------
    top_factors : list of factor dicts from predict() (sorted by |shap|)
    base_value  : float — model mean prediction (background)
    predicted_score : float — final predicted score
    """
    # Show top 5 factors in reverse order (biggest at top)
    factors = top_factors[:5][::-1]

    labels = [f"{f['icon']} {f['label']}" for f in factors]
    shap_vals = [f["shap"] for f in factors]
    colors = ["#D96B6B" if s > 0 else "#4CAF7D" for s in shap_vals]

    fig = go.Figure()

    fig.add_trace(go.Bar(
        x=shap_vals,
        y=labels,
        orientation="h",
        marker=dict(
            color=colors,
            line=dict(width=0),
        ),
        text=[f"{'+' if s > 0 else ''}{s:.2f}" for s in shap_vals],
        textposition="outside",
        textfont=dict(size=11, color="#2C3E35"),
        hovertemplate="<b>%{y}</b><br>SHAP contribution: %{x:.3f}<extra></extra>",
    ))

    # Add vertical line at 0
    fig.add_vline(
        x=0,
        line_dash="solid",
        line_color="#B0C0B5",
        line_width=1.5,
    )

    fig.update_layout(
        title=dict(
            text="What shaped your score",
            font=dict(size=15, color="#2C3E35", family="Inter"),
            x=0,
        ),
        xaxis=dict(
            title="Impact on predicted score",
            title_font=dict(size=11, color="#5a7060"),
            tickfont=dict(size=10),
            showgrid=True,
            gridcolor="#EDF2EE",
            zeroline=False,
        ),
        yaxis=dict(
            tickfont=dict(size=11, color="#2C3E35"),
            showgrid=False,
        ),
        plot_bgcolor="white",
        paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=60, t=45, b=30),
        height=280,
        showlegend=False,
        annotations=[
            dict(
                x=0.98, y=1.08,
                xref="paper", yref="paper",
                text="Red = increases score · Green = decreases score",
                showarrow=False,
                font=dict(size=9.5, color="#7A9080"),
                xanchor="right",
            )
        ],
    )

    return fig


def gauge_chart(
    score: float,
    confidence_low: float,
    confidence_high: float,
    risk_tier: str,
) -> go.Figure:
    """
    Animated speedometer-style gauge chart for GAD-7 score.
    """
    TIER_COLORS = {
        "Minimal": "#4CAF7D",
        "Subthreshold": "#F4C842",
        "Moderate": "#E8834A",
        "Severe": "#D96B6B",
    }
    color = TIER_COLORS.get(risk_tier, "#7BA7C7")

    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=score,
        delta={
            "reference": 10,
            "increasing": {"color": "#D96B6B"},
            "decreasing": {"color": "#4CAF7D"},
            "valueformat": ".1f",
            "suffix": " vs moderate threshold",
        },
        number=dict(
            font=dict(size=40, color="#2C3E35", family="Inter"),
            suffix="<span style='font-size:16px; color:#6a8070'>/21</span>",
            valueformat=".1f",
        ),
        gauge=dict(
            axis=dict(
                range=[0, 21],
                tickwidth=1,
                tickcolor="#C8D8C0",
                tickvals=[0, 5, 10, 15, 21],
                ticktext=["0", "5", "10", "15", "21"],
                tickfont=dict(size=11, color="#5a7060"),
            ),
            bar=dict(color=color, thickness=0.7),
            bgcolor="white",
            borderwidth=0,
            steps=[
                {"range": [0, 5],   "color": "#E8F5EE"},
                {"range": [5, 10],  "color": "#FEF9E7"},
                {"range": [10, 15], "color": "#FEF3EB"},
                {"range": [15, 21], "color": "#FDEEEE"},
            ],
            threshold=dict(
                line=dict(color="#2C3E35", width=3),
                thickness=0.85,
                value=score,
            ),
        ),
        title=dict(
            text=f"<span style='font-size:14px; color:#5a7060'>Predicted Anxiety Score</span><br>"
                 f"<span style='font-size:12px; color:#8a9890'>80% CI: {confidence_low:.1f} – {confidence_high:.1f}</span>",
            font=dict(family="Inter"),
        ),
    ))

    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=30, r=30, t=20, b=10),
        height=280,
        font=dict(family="Inter"),
    )

    return fig


def factor_radar_chart(top_factors: List[Dict], feature_meta: dict) -> go.Figure:
    """
    Spider/radar chart showing user values vs population medians for top features.
    """
    MEDIANS = {
        "sleep_wknight": 7.0,
        "sleep_wkend": 8.0,
        "lone_lackcompanion": 2.0,
        "lone_leftout": 1.5,
        "lone_isolated": 1.5,
        "stress1": 2.0,
        "stress2": 2.0,
        "stress3": 1.5,
        "stress4": 1.5,
        "aca_impa": 2.5,
        "time_manage": 3.0,
    }

    cols = [f["col"] for f in top_factors[:6]]
    labels = [f['icon'] + ' ' + f['label'] for f in top_factors[:6]]
    user_vals = [f["value"] for f in top_factors[:6]]
    median_vals = [MEDIANS.get(c, 3) for c in cols]

    fig = go.Figure()

    fig.add_trace(go.Scatterpolar(
        r=user_vals + [user_vals[0]],
        theta=labels + [labels[0]],
        fill="toself",
        fillcolor="rgba(107,158,120,0.2)",
        line=dict(color="#6B9E78", width=2),
        name="You",
    ))

    fig.add_trace(go.Scatterpolar(
        r=median_vals + [median_vals[0]],
        theta=labels + [labels[0]],
        fill="toself",
        fillcolor="rgba(123,167,199,0.1)",
        line=dict(color="#7BA7C7", width=2, dash="dash"),
        name="Typical student",
    ))

    fig.update_layout(
        polar=dict(
            radialaxis=dict(visible=True, showticklabels=False),
            bgcolor="rgba(0,0,0,0)",
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.2,
            xanchor="center",
            x=0.5,
            font=dict(size=11),
        ),
        margin=dict(l=40, r=40, t=20, b=40),
        height=280,
        font=dict(family="Inter", color="#2C3E35"),
        title=dict(
            text="Your profile vs typical student",
            font=dict(size=13, color="#2C3E35"),
            x=0.5,
        ),
    )

    return fig
