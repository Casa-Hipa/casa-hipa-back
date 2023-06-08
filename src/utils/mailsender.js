import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";
import env from 'dotenv'
env.config()
const api_key = process.env.SEND_GRID_API_KEY

const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: api_key,
    },
  })
);

const sendRecoveryEmail = (email, nuevapass) => {
  const mailOptions = {
    to: email,
    from: "casahipa@outlook.com",
    subject: "Recuperación de contraseña",
    text: `Se generó una nueva contraseña para tu cuenta: ${nuevapass}, por favor no olvides cambiarla desde tu perfil.`,
    html: `<h1 style="font-size: 24px; font-weight: bold; color: #333333;">Recuperación de cuenta</h1>    <p style="margin-bottom: 20px;">Hola,</p>    <p style="margin-bottom: 20px;">Hemos recibido una solicitud para recuperar tu cuenta. </p>    <p style="margin-bottom: 20px;">Se generó un nuevo password para tu cuenta:</p>    <h3 style="font-weight: bold; color: #333333;">${nuevapass}</h3>    <p style="margin-bottom: 20px;">Si tienes alguna pregunta o necesitas ayuda, por favor contáctanos a través de nuestro centro de soporte.</p>    <p style="margin-bottom: 20px;">Gracias,</p>    <p style="margin-bottom: 20px;">El equipo de Casa Hipa</p>`,
  };

  transporter.sendMail(mailOptions);
};

export { sendRecoveryEmail };
