// SDK de Mercado Pago
//const mercadopago = require("mercadopago");
import mercadopago from "mercadopago";
// Agrega credenciales
mercadopago.configure({
  access_token:
    "APP_USR-7258530070945815-051104-21e1f0028b2522c8d49cbf1850093251-1371911491",
});

const checkOut = async (req, res) => {
  // Crea un objeto de preferencia
  let preference = {
    items: [
      {
        title: req.body.title,
        unit_price: parseInt(req.body.price),
        quantity: 1,
      },
    ],
    back_urls: {
      success: `http://localhost:4200/authentication/success-payment`,
      failure: `http://localhost:4200/authentication/error-payment`,
      pending: `http://localhost:4200/authentication/error-payment`,
    },
    auto_return: "all",
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      res.json({ url: response.body.sandbox_init_point });
    })
    .catch(function (error) {
      console.log(error);
    });
};

export { checkOut };
