import { createContactMessage } from "../services/contact.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const createContact = async (request, response) => {
  const contact = await createContactMessage(request.validated.body);
  return sendSuccess(response, {
    statusCode: 201,
    message: "Contact message submitted successfully",
    data: { id: contact._id },
  });
};
