import re

SECTION_WEIGHTS = {
    "experience": 3,
    "work experience": 3,
    "employment": 3,
    "projects": 3,
    "education": 1,
    "skills": 2
}

ACTION_VERBS = [
    "managed", "performed", "developed", "designed",
    "implemented", "maintained", "optimized", "built"
]

def detect_section(text, skill):
    score = 0
    for section, weight in SECTION_WEIGHTS.items():
        pattern = rf"{section}.*?{skill}"
        if re.search(pattern, text, re.DOTALL):
            score += weight
    return score

def action_verb_bonus(text, skill):
    for verb in ACTION_VERBS:
        if f"{verb} {skill}" in text or f"{skill} {verb}" in text:
            return 2
    return 0

def frequency_score(text, skill):
    return text.count(skill)

def confidence_label(score):
    if score >= 6:
        return "High"
    elif score >= 3:
        return "Medium"
    else:
        return "Low"

def calculate_confidence(text, skills):
    results = {}
    for skill in skills:
        score = 0
        score += frequency_score(text, skill)
        score += detect_section(text, skill)
        score += action_verb_bonus(text, skill)
        results[skill] = confidence_label(score)
    return results
