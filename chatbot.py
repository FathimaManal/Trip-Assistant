from dotenv import load_dotenv 
from openai import OpenAI
import streamlit as st

load_dotenv()
client=OpenAI()
initial_message=[
    {"role":"system","content":"You are a trip planner in Dubai.you are an expert in dubai tourism,location,food,events,hotels,etc.You are able to guide users to plan their vacation to dubai.you should respond professionally.Your name is Dubai Genie.response should not exceed 200 words.always ask questions to user and help them to plan the trip.finally give a day wise itenary.Deal with user professionally"},
        {
            "role":"assistant",
            "content":"Hello,I am DG,I am your expert trip planner.How can i help you?"
        }


]
def get_response_from_llm(messages):
    completion=client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
    return completion.choices[0].message.content

if "messages" not in st.session_state:
    st.session_state.messages =initial_message

st.title("Dubai Trip Assistant App")

for message in st.session_state.messages:
    if message["role"]!="system":
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
user_message=st.chat_input("Enter your message")
if user_message:
   new_message={
        "role":"user",
        "content":user_message

    }
   st.session_state.messages.append(new_message)
   with st.chat_message("user"):
            st.markdown(user_message)
   response_content=get_response_from_llm(st.session_state.messages)
   if response_content:
        response_message={
         "role":"assistant",
        "content":response_content
        }
        st.session_state.messages.append(response_message)
        with st.chat_message("assistant"):

            st.markdown(response_content)
