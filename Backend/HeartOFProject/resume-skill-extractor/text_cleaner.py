import re

TECH_NORMALIZATION = {
    "nodejs": "node.js",
    "node js": "node.js",
    "reactjs": "react",
    "js": "javascript",
    "rest api": "rest api",
    "rest apis": "rest api",
    "c plus plus": "c++"
}

def normalize_tech_terms(text: str) -> str:
    for key, value in TECH_NORMALIZATION.items():
        text = text.replace(key, value)
    return text


def clean_text(text: str) -> str:
    """
    Clean resume text while preserving technical terms
    """

    # lowercase
    text = text.lower()

    # normalize tech keywords
    text = normalize_tech_terms(text)

    # keep letters, numbers, +, ., #
    text = re.sub(r"[^a-z0-9+#.\s]", " ", text)

    # normalize whitespace
    text = re.sub(r"\s+", " ", text)

    return text.strip()
