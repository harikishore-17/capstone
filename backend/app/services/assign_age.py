def get_age_bucket(age: int) -> str:
    if age < 0 or age > 99:
        raise ValueError("Age must be between 0 and 99")
    lower = (age // 10) * 10
    upper = lower + 10
    return f"[{lower}-{upper})"
