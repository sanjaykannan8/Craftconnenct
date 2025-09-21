from google.adk.agents import Agent
from google.adk.tools import google_search
from .prompt import marketing_agent_system_role, marketing_agent_instruction

marketing_agent = Agent(
    name="Marketing_Agent",
    model="gemini-2.0-flash",
    description=marketing_agent_system_role,
    instruction=marketing_agent_instruction,
 
)