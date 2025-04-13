import { NextApiRequest, NextApiResponse } from "next";
import openApiSpec from "@/utils/openapiSpec";

/**
 * API route to serve the OpenAPI specification.
 *
 * @param req - The incoming request object
 * @param res - The response object to send back
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(openApiSpec);
}
