from google.adk.agents import Agent
from .sub_agents.storyagent import story_teller_agent
from .sub_agents.market import marketing_agent
from .sub_agents.prompt import orchestrator_system_role, orchestrator_instruction

# The orchestrator agent with proper ADK configuration
orchestrator_agent = Agent(
    name="Orchestrator_Agent",
    model="gemini-2.0-flash",
    description=orchestrator_system_role,
    instruction=orchestrator_instruction,
    sub_agents=[story_teller_agent, marketing_agent]
)

root_agent = orchestrator_agent