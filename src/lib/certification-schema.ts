import { z } from "zod";
import {
  STANDARD_CERTIFICATION_MARKS,
  normalizeCertificationMark,
} from "@/lib/certification-options";

export const standardCertificationMarkSchema = z.enum(STANDARD_CERTIFICATION_MARKS);

export const certificationNameSchema = z.string().trim().min(1).transform(normalizeCertificationMark);
