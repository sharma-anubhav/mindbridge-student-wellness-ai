"""
MindBridge — Fairness Visualization Utilities
Plotly charts for demographic parity, equalized odds, and calibration.
"""

import plotly.graph_objects as go
import plotly.express as px
from typing import Dict, Any

from src.utils.constants import FAIRNESS_GROUPS

# Label maps for display
COL_DISPLAY_LABELS = {
    # Gender
    "gender_male": "Men",
    "gender_female": "Women",
    "gender_nonbin": "Non-binary",
    "gender_queer": "Genderqueer",
    "gender_trans": "Transgender",
    # Race
    "race_white": "White",
    "race_black": "Black / Afr. Am.",
    "race_asian": "Asian / Asian Am.",
    "race_his": "Hispanic / Latine",
    "race_ainaan": "Am. Indian / AN",
    "race_mides": "Middle Eastern / NA",
    "race_other": "Other / Multiracial",
    # Sexual orientation
    "sexual_h": "Heterosexual",
    "sexual_l": "Lesbian",
    "sexual_g": "Gay",
    "sexual_bi": "Bisexual",
    "sexual_queer": "Queer",
    "sexual_asexual": "Asexual",
    # International
    "Domestic": "Domestic",
    "International": "International",
}

PALETTE = [
    "#6B9E78", "#7BA7C7", "#9B85C0", "#E8834A",
    "#D96B6B", "#F4C842", "#4CAF7D", "#3A6A8A",
]


def _get_label(col: str) -> str:
    return COL_DISPLAY_LABELS.get(col, col)


def demographic_parity_chart(group_data: Dict[str, Any]) -> go.Figure:
    """
    Bar chart: predicted positive rate vs true prevalence by subgroup.
    Illustrates demographic parity (or lack thereof).
    """
    subgroups = list(group_data.keys())
    if not subgroups:
        return _empty_chart("No data available for this group")

    true_prev = [group_data[sg]["true_prevalence"] * 100 for sg in subgroups]
    pred_rate  = [group_data[sg]["predicted_positive_rate"] * 100 for sg in subgroups]
    labels = [_get_label(sg) for sg in subgroups]

    fig = go.Figure()

    fig.add_trace(go.Bar(
        name="Actual prevalence",
        x=labels,
        y=true_prev,
        marker=dict(color="#6B9E78", opacity=0.85),
        text=[f"{v:.1f}%" for v in true_prev],
        textposition="outside",
        textfont=dict(size=10),
        hovertemplate="<b>%{x}</b><br>Actual: %{y:.1f}%<extra></extra>",
    ))

    fig.add_trace(go.Bar(
        name="Predicted rate",
        x=labels,
        y=pred_rate,
        marker=dict(color="#7BA7C7", opacity=0.85),
        text=[f"{v:.1f}%" for v in pred_rate],
        textposition="outside",
        textfont=dict(size=10),
        hovertemplate="<b>%{x}</b><br>Predicted: %{y:.1f}%<extra></extra>",
    ))

    _style_fairness_chart(fig, "Demographic Parity", "Moderate+ rate (%)", labels)
    return fig


def equalized_odds_chart(group_data: Dict[str, Any]) -> go.Figure:
    """
    Grouped bar chart: True Positive Rate and False Positive Rate by subgroup.
    Illustrates equalized odds.
    """
    subgroups = list(group_data.keys())
    if not subgroups:
        return _empty_chart("No data available for this group")

    tpr = [group_data[sg]["tpr"] * 100 for sg in subgroups]
    fpr = [group_data[sg]["fpr"] * 100 for sg in subgroups]
    labels = [_get_label(sg) for sg in subgroups]

    fig = go.Figure()

    fig.add_trace(go.Bar(
        name="True Positive Rate (Sensitivity)",
        x=labels,
        y=tpr,
        marker=dict(color="#4CAF7D", opacity=0.85),
        text=[f"{v:.1f}%" for v in tpr],
        textposition="outside",
        textfont=dict(size=10),
        hovertemplate="<b>%{x}</b><br>TPR: %{y:.1f}%<extra></extra>",
    ))

    fig.add_trace(go.Bar(
        name="False Positive Rate",
        x=labels,
        y=fpr,
        marker=dict(color="#D96B6B", opacity=0.75),
        text=[f"{v:.1f}%" for v in fpr],
        textposition="outside",
        textfont=dict(size=10),
        hovertemplate="<b>%{x}</b><br>FPR: %{y:.1f}%<extra></extra>",
    ))

    _style_fairness_chart(fig, "Equalized Odds (TPR & FPR)", "Rate (%)", labels)
    return fig


def calibration_chart(group_data: Dict[str, Any]) -> go.Figure:
    """
    Scatter plot: mean predicted probability vs true prevalence per group.
    Perfect calibration = points on diagonal.
    """
    subgroups = list(group_data.keys())
    if not subgroups:
        return _empty_chart("No data available for this group")

    labels = [_get_label(sg) for sg in subgroups]
    true_prev  = [group_data[sg]["true_prevalence"] * 100 for sg in subgroups]
    pred_prob  = [group_data[sg]["mean_pred_prob"] * 100 for sg in subgroups]
    sizes      = [max(10, min(40, group_data[sg]["n"] / 500)) for sg in subgroups]

    fig = go.Figure()

    # Perfect calibration line
    fig.add_trace(go.Scatter(
        x=[0, 60],
        y=[0, 60],
        mode="lines",
        line=dict(color="#B0C0B5", dash="dash", width=1.5),
        name="Perfect calibration",
        hoverinfo="skip",
    ))

    fig.add_trace(go.Scatter(
        x=true_prev,
        y=pred_prob,
        mode="markers+text",
        text=labels,
        textposition="top center",
        textfont=dict(size=10),
        marker=dict(
            color=PALETTE[:len(subgroups)],
            size=sizes,
            opacity=0.85,
            line=dict(color="white", width=2),
        ),
        hovertemplate="<b>%{text}</b><br>Actual: %{x:.1f}%<br>Predicted: %{y:.1f}%<extra></extra>",
        name="Subgroup",
    ))

    fig.update_layout(
        title=dict(
            text="Calibration by Group",
            font=dict(size=14, color="#2C3E35", family="Inter"),
            x=0,
        ),
        xaxis=dict(
            title="Actual prevalence (%)",
            title_font=dict(size=11, color="#5a7060"),
            showgrid=True,
            gridcolor="#EDF2EE",
            range=[0, max(true_prev + [20]) * 1.2],
        ),
        yaxis=dict(
            title="Mean predicted probability (%)",
            title_font=dict(size=11, color="#5a7060"),
            showgrid=True,
            gridcolor="#EDF2EE",
            range=[0, max(pred_prob + [20]) * 1.2],
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="white",
        height=320,
        margin=dict(l=20, r=20, t=45, b=30),
        legend=dict(font=dict(size=10), orientation="h", y=-0.2),
        font=dict(family="Inter"),
    )

    return fig


def mean_score_chart(group_data: Dict[str, Any]) -> go.Figure:
    """
    Horizontal bar chart: mean predicted GAD-7 score by subgroup.
    """
    subgroups = list(group_data.keys())
    if not subgroups:
        return _empty_chart("No data available for this group")

    labels = [_get_label(sg) for sg in subgroups]
    true_scores = [group_data[sg]["mean_true_score"] for sg in subgroups]
    pred_scores = [group_data[sg]["mean_predicted_score"] for sg in subgroups]

    # Sort by true score
    sorted_idx = sorted(range(len(true_scores)), key=lambda i: true_scores[i])
    labels      = [labels[i] for i in sorted_idx]
    true_scores = [true_scores[i] for i in sorted_idx]
    pred_scores = [pred_scores[i] for i in sorted_idx]

    fig = go.Figure()

    fig.add_trace(go.Bar(
        name="Actual mean score",
        y=labels,
        x=true_scores,
        orientation="h",
        marker=dict(color="#6B9E78", opacity=0.85),
        text=[f"{v:.2f}" for v in true_scores],
        textposition="outside",
        hovertemplate="<b>%{y}</b><br>Actual: %{x:.2f}/21<extra></extra>",
    ))

    fig.add_trace(go.Bar(
        name="Predicted mean score",
        y=labels,
        x=pred_scores,
        orientation="h",
        marker=dict(color="#7BA7C7", opacity=0.75),
        text=[f"{v:.2f}" for v in pred_scores],
        textposition="outside",
        hovertemplate="<b>%{y}</b><br>Predicted: %{x:.2f}/21<extra></extra>",
    ))

    fig.update_layout(
        title=dict(
            text="Mean GAD-7 Score by Subgroup",
            font=dict(size=14, color="#2C3E35", family="Inter"),
            x=0,
        ),
        xaxis=dict(
            title="Mean score (0–21)",
            title_font=dict(size=11, color="#5a7060"),
            showgrid=True,
            gridcolor="#EDF2EE",
            range=[0, 21],
        ),
        yaxis=dict(tickfont=dict(size=11), showgrid=False),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="white",
        barmode="group",
        height=max(280, len(subgroups) * 45 + 100),
        margin=dict(l=20, r=70, t=45, b=30),
        legend=dict(font=dict(size=10), orientation="h", y=-0.15),
        font=dict(family="Inter"),
    )

    return fig


def _style_fairness_chart(fig, title, y_title, labels):
    fig.update_layout(
        title=dict(
            text=title,
            font=dict(size=14, color="#2C3E35", family="Inter"),
            x=0,
        ),
        xaxis=dict(tickfont=dict(size=10), showgrid=False, tickangle=-20 if len(labels) > 4 else 0),
        yaxis=dict(
            title=y_title,
            title_font=dict(size=11, color="#5a7060"),
            showgrid=True,
            gridcolor="#EDF2EE",
        ),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="white",
        barmode="group",
        height=320,
        margin=dict(l=20, r=20, t=45, b=40),
        legend=dict(font=dict(size=10), orientation="h", y=-0.25),
        font=dict(family="Inter"),
    )


def _empty_chart(msg: str) -> go.Figure:
    fig = go.Figure()
    fig.add_annotation(
        text=msg,
        xref="paper", yref="paper",
        x=0.5, y=0.5, showarrow=False,
        font=dict(size=14, color="#7A9080"),
    )
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="white",
        height=280,
    )
    return fig
