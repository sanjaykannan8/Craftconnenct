from google.adk.agents import Agent
from google.adk.tools import google_search
from .prompt import story_teller_system_role, story_teller_instruction

story_teller_agent = Agent(
    name="Story_Teller_Agent",
    model="gemini-2.0-flash",
    description=story_teller_system_role,
    instruction=story_teller_instruction,
)
