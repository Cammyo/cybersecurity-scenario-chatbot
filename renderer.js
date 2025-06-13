document.addEventListener('DOMContentLoaded', async () => {
    const scenarioList = document.getElementById('scenario-list');
    const newScenarioInput = document.getElementById('new-scenario');
    const addScenarioButton = document.getElementById('add-scenario');
    const userInput = document.getElementById('user-input');
    const sendMessageButton = document.getElementById('send-message');
    const messagesDiv = document.getElementById('messages');
    let currentConversationId = null;

    // Function to add a message to the chat
    function addMessage(sender, text) {
        const message = document.createElement('div');
        message.classList.add(sender === 'User' ? 'user-message' : 'bot-message');
      
        const messageText = document.createElement(sender === 'Bot' ? 'pre' : 'p');
        messageText.textContent = text; // Preserve exact formatting
        message.appendChild(messageText);
      
        const messagesDiv = document.getElementById('messages');
        messagesDiv.appendChild(message);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom
      }
                    
    // Display a welcome message when the app loads
    function showWelcomeMessage() {
      const welcomeText = "Welcome to the Cybersecurity Scenario Chatbot! Please select a scenario on the left or come up with and save your own!"; // Customize your welcome message
      addMessage('Bot', welcomeText);
    }
  
    // Initial load of scenarios and welcome message
    async function initializeApp() {
      await loadScenarios();
      showWelcomeMessage(); // Show the welcome message
    }
  
    // Function to load scenarios from the database
    async function loadScenarios() {
      const scenarios = await window.api.fetchScenarios();
      scenarioList.innerHTML = '';
      scenarios.forEach(({ id, scenario }) => {
        const li = document.createElement('li');
        li.classList.add('scenario-item');
        li.textContent = scenario;
  
        // Create a delete button for each scenario
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', async (e) => {
          e.stopPropagation(); // Prevent triggering the scenario click event
          await window.api.deleteScenario(id);
          loadScenarios();
        });
  
        li.appendChild(deleteButton);
  
        // Send scenario to chatbot when clicked
        li.addEventListener('click', () => sendMessage(scenario));
        scenarioList.appendChild(li);
      });
    }
  
    // Send a message to the chatbot and handle the response
    async function sendMessage(query) {
        if (!query) return;
      
        addMessage('User', query);
      
        try {
          const response = await window.api.sendToChatbot({
            query,
            conversation_id: currentConversationId,
          });
      
          console.log('Chatbot response:', response);
      
          if (response.conversation_id) {
            currentConversationId = response.conversation_id;
          }
      
          addMessage('Bot', response.answer);
        } catch (error) {
          console.error('Error sending message to chatbot:', error);
          addMessage('Bot', 'Something went wrong. Please try again.');
        }
    }
      
    document.getElementById('new-scenario-button').addEventListener('click', startNewScenario);
      
    
    function startNewScenario() {
        currentConversationId = null; // Clear the conversation context
      
        // Clear the chat messages
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
      
        // Add the welcome message again
        addMessage('Bot', 'Welcome to the Cybersecurity Scenario Chatbot! Please select a scenario on the left or come up with and save your own!');
    }
            

    // Add a new scenario to the database
    addScenarioButton.addEventListener('click', async () => {
      const scenario = newScenarioInput.value.trim();
      if (scenario) {
        await window.api.addScenario(scenario);
        newScenarioInput.value = '';
        loadScenarios();
      }
    });
  
    // Handle "Enter" key to send a message
    userInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const query = userInput.value.trim();
        if (query) {
          await sendMessage(query);
          userInput.value = ''; // Clear input field
        }
      }
    });
  
    // Send a custom user message when clicking the "Send" button
    sendMessageButton.addEventListener('click', async () => {
      const query = userInput.value.trim();
      if (query) {
        await sendMessage(query);
        userInput.value = ''; // Clear input field
      }
    });
  
    // Initialize the app
    await initializeApp();
});
  