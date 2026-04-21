def fake_skill_score_from_llm(verdict: str, accuracy_score) -> int:
    """
    Derive a fake-skill risk score from the LLM accuracy verdict.
    This replaces the old hardcoded formula entirely.

    Mapping:
      Proven     → Low risk    (score = accuracy_score mapped to 0-30 range)
      Plausible  → Moderate    (score = 31-59)
      Overstated → High risk   (score = 60-100)
      Unverified → Moderate    (score = 50, cannot confirm or deny)
    """
    verdict = (verdict or "Unverified").strip()

    if verdict == "Proven":
        # accuracy_score is high (70-100); invert into low risk (0-30)
        if accuracy_score is not None:
            return max(0, min(30, 100 - int(accuracy_score)))
        return 15  # default low risk

    elif verdict == "Plausible":
        if accuracy_score is not None:
            # Map accuracy 40-69 → risk 31-59
            return max(31, min(59, 100 - int(accuracy_score)))
        return 45  # default moderate risk

    elif verdict == "Overstated":
        if accuracy_score is not None:
            # accuracy is low (0-39); map directly to high risk (60-100)
            return max(60, min(100, 100 - int(accuracy_score)))
        return 80  # default high risk

    else:  # Unverified or unknown
        return 50


def fake_skill_score(skill, confidence, github_data=None, verdict=None, accuracy_score=None):
    """
    Main entry point for fake-skill risk scoring.
    - If LLM verdict is available, uses LLM-driven scoring (accurate).
    - Falls back to the legacy weight-based formula only if LLM data is absent.
    """
    # --- LLM-Driven Path (preferred) ---
    if verdict and verdict != "Unverified":
        return fake_skill_score_from_llm(verdict, accuracy_score)

    # --- Legacy Weight-Based Fallback (kept as safety net) ---
    base = {
        "High":   20,
        "Medium": 50,
        "Low":    80,
    }.get(str(confidence), 60)

    if not github_data:
        return min(100, base + 10)

    loc     = github_data.get("loc", 0)
    commits = github_data.get("commits", 0)
    status  = github_data.get("status", "Not Verified")

    score = base
    if status == "Verified":
        score -= 30
    if loc > 500:
        score -= 10
    if commits > 10:
        score -= 10

    return max(0, min(100, score))


def fake_label(score: int) -> str:
    if score < 30:
        return "Low Risk"
    if score < 60:
        return "Moderate Risk"
    return "High Risk"
