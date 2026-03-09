import { z } from "zod";

export const employeeSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  employeeId: z.string().min(4, "ID must be at least 4 characters").max(10, "ID too long"),
  postalCode: z.string().regex(/^[A-Z0-9 ]{5,7}$/i, "Invalid postal code format"),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;