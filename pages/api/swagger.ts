import { NextApiRequest, NextApiResponse } from "next";
import openApiSpec from "@/utils/openapiSpec";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(openApiSpec);
}
