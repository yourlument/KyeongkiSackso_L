import { z } from "zod";

export const PORTAL = z.enum(["OFFICIAL", "SUPPLIER"]);

const emailField = z.string().email();
export const isValidEmail = (email: string): boolean => emailField.safeParse(email).success;

export const loginSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
  portal: PORTAL.optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

const passwordField = z
  .string()
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    "영문, 숫자, 특수문자 조합 8자 이상",
  );

export const accountStepSchema = z
  .object({
    email: z.string().email("이메일을 입력하세요"),
    password: passwordField,
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

export const officialTaxInvoiceSchema = z.object({
  orgRepresentativeName: z.string().trim().max(100, "대표자 성함은 100자 이내로 입력하세요").optional(),
  orgTaxEmail: z.union([
    z.literal(""),
    z.string().trim().email("세금계산서 수신용 이메일 형식이 올바르지 않습니다"),
  ]).optional(),
  orgAddress: z.string().trim().max(255, "사업장 주소는 255자 이내로 입력하세요").optional(),
});
export type OfficialTaxInvoiceInput = z.infer<typeof officialTaxInvoiceSchema>;

export const officialSignupSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  password: passwordField,
  organizationBizNo: z.string().min(1, "관공서 사업자 등록번호를 입력하세요"),
  organizationName: z.string().min(1, "소속 지자체/기관명을 입력하세요"),
  departmentName: z.string().min(1, "소속 부서명을 입력하세요"),
  departmentPhone: z.string().min(1, "부서 대표 전화번호를 입력하세요"),
  name: z.string().trim().min(1, "성명을 입력하세요"),
  position: z.string().trim().min(1, "직책을 입력하세요"),
  termIds: z.array(z.string()).default([]),
}).merge(officialTaxInvoiceSchema);
export type OfficialSignupInput = z.infer<typeof officialSignupSchema>;

export function validateBizNo(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 10) return false;
  const w = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += w[i] * Number(digits[i]);
  sum += Math.floor((5 * Number(digits[8])) / 10);
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[9]);
}

export const supplierSignupSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  password: passwordField,
  companyName: z.string().min(1, "업체명을 입력하세요"),
  representativeName: z.string().min(1, "대표자 성함을 입력하세요"),
  businessRegistrationNo: z.string().min(1, "사업자 등록번호를 입력하세요"),
  businessLicenseFileUrl: z.string().min(1, "사업자등록증을 첨부하세요"),
  corporateRegistrationNo: z.string().optional(),
  businessType: z.string().trim().min(1, "입력값을 확인해 주세요"),
  businessItem: z.string().trim().min(1, "입력값을 확인해 주세요"),
  address: z.string().min(1, "사업장 소재지를 입력하세요"),
  phone: z.string().min(1, "업체 대표 전화번호를 입력하세요"),
  termIds: z.array(z.string()).default([]),
});
export type SupplierSignupInput = z.infer<typeof supplierSignupSchema>;
