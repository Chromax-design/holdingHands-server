const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { selectData } = require("./sqlHandlers");

const generateLink = () => {
  const token = crypto.randomBytes(16).toString("hex");
  const expirationTime = Date.now() + 24 * 60 * 60 * 1000;
  const link = `${backendUrl}?userId=${userId}&token=${token}&expires=${expirationTime}&redirect=${frontendUrl}/${userId}/${token}`;


  return link;
};

const verifyOTP = (storedTimestamp)=> {
  const currentTime = new Date();
  const timeDifference = currentTime - storedTimestamp;
  const isExpired = timeDifference > 60 * 60 * 1000; // 1 hr
  if (isExpired) {
    return false
  }else{
    return true
  }
}

const genAccessToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.PRIVATE_KEY, {
    expiresIn: "2d",
  });
  return accessToken;
};

const createMessage = (messsage, subject, otp) => {
  return `<!doctype html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <title>${subject}</title>
            <style>
        @media only screen and (max-width: 620px) {
          table.body h1 {
            font-size: 28px !important;
            margin-bottom: 10px !important;
          }
        
          table.body p,
        table.body ul,
        table.body ol,
        table.body td,
        table.body span {
            font-size: 16px !important;
          }
        
          table.body .wrapper,
        table.body .article {
            padding: 10px !important;
          }
        
          table.body .content {
            padding: 0 !important;
          }
        
          table.body .container {
            padding: 0 !important;
            width: 100% !important;
          }
        
          table.body .main {
            border-left-width: 0 !important;
            border-radius: 0 !important;
            border-right-width: 0 !important;
          }
        
          table.body .btn table {
            width: 100% !important;
          }
        }
        @media all {
          .ExternalClass {
            width: 100%;
          }
        
          .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
            line-height: 100%;
          }
        
          .apple-link a {
            color: inherit !important;
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            text-decoration: none !important;
          }
        
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
          }
        }
        </style>
          </head>
          <body style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
            <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">This is preheader text. Some clients will show this text as a preview.</span>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
              <tr>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
                <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
                  <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
        
                    <!-- START CENTERED WHITE CONTAINER -->
                    <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
        
                      <!-- START MAIN CONTENT AREA -->
                      <tr>
                        <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                            <tr>
                              <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                                <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">${messsage}</p>
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                                  <tbody>
                                    <tr>
                                      <td align="left" style="font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                          <tbody>
                                            <tr>
                                              <td style="font-family: monospace; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center;" valign="top" align="center"> <p style="font-family: monospace;font-size: 14px; font-weight: bold; margin: 0;">OTP: ${otp}</p> </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
        
                    <!-- END MAIN CONTENT AREA -->
                    </table>
                    <!-- END CENTERED WHITE CONTAINER -->
        
                    <!-- START FOOTER -->
                    <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                        <tr>
                          <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                            <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Wehold a hand Inc, 2023</span>
                          </td>
                        </tr>
                      </table>
                    </div>
                    <!-- END FOOTER -->
        
                  </div>
                </td>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
              </tr>
            </table>
          </body>
        </html>`;
};

module.exports = {
  generateLink,
  genAccessToken,
  createMessage,
  verifyOTP,
};
