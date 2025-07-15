import { LineLogin } from 'capacitor-line-login';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    LineLogin.echo({ value: inputValue })
}
