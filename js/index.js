import { firebaseConfig } from "./services/firebaseConfig.js"; // Chamando as credenciais 

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
// Verifica se já está logado
auth.onAuthStateChanged(user => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

// No arquivo index.html, modifique a função de login/registro:
// NO index.html, SUBSTITUA as funções login() e register() por estas:
document.getElementById("btn-login").addEventListener("click", login);
document.getElementById("btn-register").addEventListener("click", register);
function login() {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, pass)
    .then((userCredential) => {
      checkOnboardingStatus(userCredential.user);
    })
    .catch(error => showError(error));
}

function register() {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  if (pass.length < 6) {
    showError({ message: "A senha deve ter pelo menos 6 caracteres." });
    return;
  }

  auth.createUserWithEmailAndPassword(email, pass)
    .then((userCredential) => {
      checkOnboardingStatus(userCredential.user);
    })
    .catch(error => showError(error));
}


// Nova função para verificar onboarding
function checkOnboardingStatus(user) {
  const db = firebase.database();
  db.ref('usuarios/' + user.uid + '/perfil').once('value').then(snapshot => {
    const perfil = snapshot.val();
    if (perfil && perfil.onboardingCompleto) {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "onboarding.html";
    }
  }).catch(() => {
    // Em caso de erro, vai para onboarding
    window.location.href = "onboarding.html";
  });
}

function showError(error) {
  const el = document.getElementById('error-box');
  el.style.display = 'block';
  // Tradução simples de erros comuns
  let msg = error.message;
  if (error.code === 'auth/wrong-password') msg = "Senha incorreta.";
  if (error.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
  if (error.code === 'auth/email-already-in-use') msg = "Este e-mail já está cadastrado.";
  el.innerText = msg;
}