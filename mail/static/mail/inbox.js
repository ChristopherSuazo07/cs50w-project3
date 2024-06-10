document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  document.getElementById('compose-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const recipient = document.getElementById('compose-recipients').value
    const subject = document.getElementById('compose-subject').value
    const body = document.getElementById('compose-body').value

    console.log(`===================>${body}`)

    try {
      const response = await fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: recipient,
          subject: subject,
          body: body
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      const result = await response.json();
  
      // Print result
      console.log(result);
  
      if (response.status === 201) {
        load_mailbox('sent');
      } else {
        console.error("Error al procesar la solicitud:", result.error);
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
    
  });
    
   // By default, load the inbox
  load_mailbox('inbox');

     
})

  


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#ver-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function Email(mail_id) {
  fetch(`/emails/${mail_id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.getElementById('ver-email').style.display = 'block';

      const div = document.getElementById('ver-email')

      div.innerHTML = `
    <h3>View Email</h3>
 
    <div class="card">
        <div class="card-body">
          <h5 class="card-title">${email.subject}</h5>
          <h6 class="card-subtitle mb-2 text-muted">From:  ${email.sender}</h6>
          <p class="card-text">${email.body}</p>
          <hr>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">To: ${email.recipients}</li>
            <li class="list-group-item">Timestamp: ${email.timestamp}</li>
        </ul>
        </div>
    </div>
    `
      if(email.read != true){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }
      const div_padre =  document.getElementById('ver-email')

      const button_reply = document.createElement('button')    
      button_reply.className = 'btn btn-success mr-2 mt-2';
      button_reply.textContent = 'Replay'
      div_padre.append(button_reply)

      button_reply.addEventListener('click', () => {
        compose_email();
        const compose_recipients =  document.getElementById('compose-recipients');
        const compose_subject = document.getElementById('compose-subject');
        const compose_body = document.getElementById('compose-body');
        
        subject_new = email.subject.startsWith('Re:') ? email.subject : 'Re: ' + email.subject;

        compose_recipients.value = email.sender;
        compose_subject.value = subject_new
        compose_body.value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

      });

      const button = document.createElement('button')
     
      if(email.archived != true) {
        button.className = 'btn btn-primary mt-2';
          archived = 'Archive'
      }else{
        button.className = 'btn btn-danger mt-2';
        archived = "Unarchive"
      }
      button.textContent =  archived

      div_padre.append(button)

      button.addEventListener('click', () => {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !email.archived
          })
        })
        .then( () => {
          load_mailbox('archive')
        })
      })





      // ... do something else with email ...
    });

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#ver-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);

      emails.forEach(element => {
        const element_div = document.createElement('div');
        element_div.innerHTML = `
      <div class="card mb-3 ${element.read ? 'bg-secondary text-white' : 'bg-light' } ">
        <div class="card-header">
          ${element.sender}
        </div>
        <div class="card-body">
          <blockquote class="blockquote mb-0">
            <p>${element.subject}</p>
            <footer class="blockquote-footer ${element.read ? 'bg-secondary text-white'  : 'bg-light'} ">${element.timestamp}<cite title="Source Title"> </cite></footer>
          </blockquote>
        </div>
      </div>`;
        element_div.addEventListener('click', () => {
          // get emil with id
          Email(element.id)
        });
        document.getElementById('emails-view').append(element_div)
      });

      // ... do something else with emails ...
    });


}

