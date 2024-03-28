
        const generateEmail = async () => {
            try {
                console.log("hi");
                const response = await fetch('/api/generate-email', {
                    method: 'POST'
                });
                const data = await response.json();
                document.getElementById('emailStatus').innerText = `New email generated: ${data.email}`;
            } catch (error) {
                console.error('Error generating email:', error);
                document.getElementById('emailStatus').innerText = 'Error generating email';
            }
        };

        // Function to handle fetching emails
        const viewEmails = async () => {
            try {
                const response = await fetch('/api/fetch-messages');
                const data = await response.json();
                document.getElementById('emailStatus').innerText = `Fetched emails: ${JSON.stringify(data.emails)}`;
            } catch (error) {
                console.error('Error fetching emails:', error);
                document.getElementById('emailStatus').innerText = 'Error fetching emails';
            }
        };

        // Function to handle deleting the current email
        const deleteEmail = async () => {
            try {
                const response = await fetch('/api/delete-email', {
                    method: 'DELETE'
                });
                const data = await response.json();
                document.getElementById('emailStatus').innerText = data.message;
            } catch (error) {
                console.error('Error deleting email:', error);
                document.getElementById('emailStatus').innerText = 'Error deleting email';
            }
        };

        // Add event listeners to the buttons
        document.getElementById('generateEmailBtn').addEventListener('click', generateEmail);
        document.getElementById('viewEmailsBtn').addEventListener('click', viewEmails);
        document.getElementById('deleteEmailBtn').addEventListener('click', deleteEmail);
