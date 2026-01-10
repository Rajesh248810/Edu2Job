
import os
import google.generativeai as genai
from django.conf import settings

def get_gemini_suggestions(query, suggestion_type, context=None):
    """
    Fetches suggestions from Gemini API based on the query and type.
    
    Args:
        query (str): The user's input.
        suggestion_type (str): The type of field (degree, specialization, skill, university, etc.)
        context (dict, optional): Additional context like selected degree.
        
    Returns:
        list: A list of suggested strings.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        print("GEMINI_API_KEY not found.")
        return []

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = ""
        context = context or {}
        
        if suggestion_type == 'degree':
            prompt = f"List 5 common academic degrees that start with or are related to '{query}'. Return only the degree names separated by commas, no other text."
        elif suggestion_type == 'specialization':
            if context.get('degree'):
                 prompt = f"List 5 academic specializations or majors for the degree '{context['degree']}' that start with or are related to '{query}'. Return only the names separated by commas, no other text."
            else:
                 prompt = f"List 5 common academic specializations or majors that start with or are related to '{query}'. Return only the names separated by commas, no other text."
        elif suggestion_type == 'university':
             prompt = f"List 5 universities or colleges that match '{query}'. Return only the names separated by commas, no other text."
        elif suggestion_type == 'skill':
            prompt = f"List 5 professional skills related to '{query}'. Return only the skill names separated by commas, no other text."
        elif suggestion_type == 'company':
             prompt = f"List 5 companies that match '{query}'. Return only the names separated by commas, no other text."
        elif suggestion_type == 'role':
             prompt = f"List 5 job roles matching '{query}'. Return only the names separated by commas."
        elif suggestion_type == 'certification':
             prompt = f"List 5 popular professional certifications related to '{query}'. Return only the certification names separated by commas."
        else:
            prompt = f"List 5 suggestions for '{query}'. Return comma separated values."

        response = model.generate_content(prompt)
        text = response.text
        
        # Parse comma separated values
        suggestions = [s.strip() for s in text.split(',')]
        return suggestions[:10] # Limit to 10 just in case
    # btech,bsc,ba,msc,mtech,phd
    except Exception as e:
        error_msg = str(e)
        print(f"Gemini API Error: {error_msg}")
        
        # Fallback Logic
        from .fallback_data import DEGREES, SPECIALIZATIONS, UNIVERSITIES, SKILLS, COMPANIES, ROLES, CERTIFICATIONS
        
        fallback_list = []
        if suggestion_type == 'degree': fallback_list = DEGREES
        elif suggestion_type == 'specialization': fallback_list = SPECIALIZATIONS
        elif suggestion_type == 'university': fallback_list = UNIVERSITIES
        elif suggestion_type == 'skill': fallback_list = SKILLS
        elif suggestion_type == 'company': fallback_list = COMPANIES
        elif suggestion_type == 'role': fallback_list = ROLES
        elif suggestion_type == 'certification': fallback_list = CERTIFICATIONS
        
        # Filter based on query
        if query:
            return [item for item in fallback_list if query.lower() in item.lower()][:10]
        return fallback_list[:10]
