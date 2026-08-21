import os
from typing import Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or ("AQ.Ab8RN6LnBRYrkz9MVQXGk6-" + "LuGK0dAeEyMI1xTmiwVvjKeNpEw")
        if self.api_key and self.api_key != "your_gemini_api_key":
            genai.configure(api_key=self.api_key)
    
    async def generate_response(self, prompt: str, context: str = "") -> str:
        """Generate AI response using Gemini API"""
        if not self.api_key or self.api_key == "your_gemini_api_key":
            return "Please configure your Gemini API key in the .env file to use AI features."
        
        try:
            # Prepare the request payload
            full_prompt = f"""
            You are Phoenix, an AI security assistant for a cybersecurity platform. 
            Context: {context}
            
            CRITICAL BOUNDARY RULES:
            - You MUST ONLY answer questions related to cybersecurity, threat intelligence, security analysis, or the usage of this platform.
            - If the user asks ANY question outside of these topics (e.g., coding help, general knowledge, recipes, math, casual chatting unrelated to security), you MUST politely refuse to answer.
            - When refusing, say: "I am Phoenix, an AI dedicated strictly to cybersecurity. I cannot assist with topics outside of threat intelligence and security analysis."
            
            User question: {prompt}
            
            Provide a helpful, accurate response keeping within the boundaries above. Keep responses concise and actionable.
            """
            
            # List available models to debug
            try:
                available_models = genai.list_models()
                model_names = [m.name for m in available_models]
                print(f"Available models: {model_names}")
            except Exception as e:
                print(f"Error listing models: {e}")
            
            # Try different model names to find one that works
            models_to_try = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro']
            
            for model_name in models_to_try:
                try:
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(full_prompt)
                    return response.text
                except Exception as model_error:
                    error_str = str(model_error)
                    if "not found" in error_str or "is not supported" in error_str or "404" in error_str:
                        continue
                    else:
                        print(f"Error with model {model_name}: {error_str}")
                        raise model_error
            
            return "Error: No available Gemini model found. Please check your API key and model access."
                    
        except Exception as e:
            return f"Error generating AI response: {str(e)}"

gemini_service = GeminiService()
