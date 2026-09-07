import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      'Please enter a valid phone number'
    ),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters'),
  honeypot: z.string().max(0, 'Bot detected'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const customOrderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\d\s\-\+\(\)]+$/.test(val), 'Please enter a valid phone number'),
  description: z.string().min(10, 'Please describe the project in at least 10 characters').max(5000),
  honeypot: z.string().max(0, 'Bot detected'),
});

export type CustomOrderData = z.infer<typeof customOrderSchema>;

export const signInvoiceSchema = z.object({
  signerName: z.string().min(2, 'Please type your full legal name').max(150),
  signerEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  reviewed: z.literal(true, { errorMap: () => ({ message: 'You must confirm you reviewed the invoice' }) }),
});

export type SignInvoiceData = z.infer<typeof signInvoiceSchema>;
