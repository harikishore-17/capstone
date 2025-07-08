from dotenv import load_dotenv
from google import genai
from google.genai import types
import os
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
def explain_with_gemini(response: dict) -> str:
    explanation = ""

    # Initialize Gemini Client
    client = genai.Client(api_key=GEMINI_API_KEY)  # Replace with env var or secure loading

    # Extract values
    prediction_label = "Readmitted" if response["prediction"] == 1 else "Not Readmitted"
    probability = response["probability"]

    # Build SHAP feature impact list
    shap_pairs = list(zip(response["shap"]["features"], response["shap"]["shap_values"]))
    shap_pairs.sort(key=lambda x: abs(x[1]), reverse=True)

    top_features_text = "\n".join(
        [f"- {feature}: SHAP = {shap:.3f}" for feature, shap in shap_pairs[:7]]
    )

    # Build dynamic prompt
    input_text = f"""
You are a medical assistant AI helping explain a hospital readmission prediction made by a machine learning model.

Here is the patient's result:
- Prediction: prediction_label
- Probability of Readmission: {round(probability * 100, 2)}%
- Model Base Value (SHAP): {round(response['shap']['base_value'], 4)}

Here are the SHAP values for each feature. These represent the contribution of each factor to the model's decision:
{{
{chr(10).join([f"- {feat}: {round(val, 4)}" for feat, val in zip(response['shap']['features'], response['shap']['shap_values'])])}
}}

Now, write a clear and medically sensitive explanation of the prediction result in **HTML format**. 
Be sure to:
- Clearly state the probability and what it means.
- Separate the explanation into sections:
  - "Factors Increasing Risk"
  - "Factors Decreasing Risk"
  - "Summary"
- Use bullet points (<ul><li>) for listing influential features.
- Only highlight the top 3–4 **positive** and **negative** SHAP contributors, based on absolute value.
- Be cautious with sensitive terms like "ICU admission", "age", etc. Don't make strong assumptions; provide balanced insights.
- Frame the explanation in a supportive, medically appropriate tone.
- End with a concise summary in <p> tags.
- Return **only valid HTML** – no markdown or plaintext.

This explanation will be shown to clinicians and care teams, so make it informative and accessible. Return the response as an HTML string.
"""

    # Prepare Gemini payload
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=input_text)
            ],
        ),
    ]

    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain"
    )

    # Stream response from Gemini
    for chunk in client.models.generate_content_stream(
        model="gemini-2.5-flash",
        contents=contents,
        config=generate_content_config,
    ):
        explanation += chunk.text

    return explanation