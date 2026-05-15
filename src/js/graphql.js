const GRAPHQL_URL = 'http://localhost:4000/graphql';


async function loginUser(email, password) {
  const query = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          id
          email
          fullName
          roles {
            name
          }
        }
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: { email, password },
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  if (!result.data || !result.data.login) {
    throw new Error('Invalid response from server');
  }
  return result.data.login;
}


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) {
    console.error('Login form not found – make sure your form has id="loginForm"');
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      const { token, user } = await loginUser(email, password);
      
      localStorage.setItem('token', token);

      
      const role = user.roles[0]?.name;
      if (role === 'student') {
        window.location.href = '/student-dashboard.html';
      } else if (role === 'lecturer') {
        window.location.href = '/lecturer-dashboard.html';
      } else if (role === 'admin') {
        window.location.href = '/admin-dashboard.html';
      } else {
        window.location.href = '/dashboard.html';
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed: ' + err.message);
    }
  });
});