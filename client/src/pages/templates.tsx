import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Eye,
  Save,
  Loader2,
  Copy,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmailTemplate {
  _id: string;
  name: string;
  slug: string;
  subject: string;
  htmlContent: string;
  category: string;
  placeholders: string[];
  isDefault: boolean;
  isActive: boolean;
}

const emailHeader = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pointify POS</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 40px; text-align: center;">
              <img src="https://pointifypos.com/imgs/logos/pointifylogo1.png" alt="Pointify" style="height: 50px; margin-bottom: 10px;">
              <p style="color: #ffffff; font-size: 14px; margin: 0; opacity: 0.9;">Manage Your Stock, Sales & Cashflow</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">`;

const emailFooter = `
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px 40px; text-align: center;">
              <img src="https://pointifypos.com/imgs/logos/pointifylogo1.png" alt="Pointify" style="height: 35px; margin-bottom: 15px;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px 0;">
                Download Pointify POS on your device
              </p>
              <p style="margin: 15px 0;">
                <a href="https://play.google.com/store/apps/details?id=com.pointify.com" style="display: inline-block; margin: 0 5px;">
                  <img src="https://pointifypos.com/imgs/gg.png" alt="Google Play" style="height: 40px;">
                </a>
                <a href="https://apps.apple.com/us/app/pointify-pos/id6456891671" style="display: inline-block; margin: 0 5px;">
                  <img src="https://pointifypos.com/imgs/apple-app-store-logo.jpg" alt="App Store" style="height: 40px; border-radius: 6px;">
                </a>
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0 0; border-top: 1px solid #374151; padding-top: 20px;">
                &copy; ${new Date().getFullYear()} Pointify. All Rights Reserved.<br>
                <a href="https://pointifypos.com" style="color: #10b981; text-decoration: none;">pointifypos.com</a>
              </p>
              <p style="color: #6b7280; font-size: 11px; margin: 10px 0 0 0;">
                Need help? Contact us via <a href="https://wa.me/254791334234" style="color: #10b981; text-decoration: none;">WhatsApp</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const starterTemplates = [
  {
    name: "Welcome Message",
    slug: "welcome",
    subject: "Welcome to Pointify POS!",
    category: "welcome",
    htmlContent: `${emailHeader}
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Welcome to Pointify!</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>{{name}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Welcome to Pointify POS! We're excited to have you on board.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your account is now active and you can start using all the features of our system to manage your stock, sales, and cashflow from anywhere.
              </p>
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px 20px; margin: 25px 0;">
                <p style="color: #166534; font-size: 14px; margin: 0;">
                  <strong>Get Started:</strong> Download our app and start selling today!
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                If you have any questions, feel free to reach out to our support team.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #10b981;">The Pointify Team</strong>
              </p>
${emailFooter}`,
  },
  {
    name: "Data Backup",
    slug: "backup",
    subject: "Your Pointify Backup - {{backup_date}}",
    category: "announcement",
    htmlContent: `${emailHeader}
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Your Data Backup is Ready!</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>{{username}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your scheduled data backup for <strong>{{shopname}}</strong> has been generated successfully.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px 40px; border-radius: 12px;">
                  <p style="color: #166534; font-size: 14px; margin: 0 0 5px 0;">Backup Date</p>
                  <p style="color: #059669; font-size: 24px; font-weight: bold; margin: 0;">{{backup_date}}</p>
                </div>
              </div>
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 25px 0;">
                <p style="color: #1e40af; font-size: 14px; margin: 0;">
                  <strong>Attached Files:</strong><br>
                  • Stock Report (Excel)<br>
                  • Products List (Excel)<br>
                  • Customers List (Excel)<br>
                  • Sales Report (Excel)
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Please download and save these files in a secure location. Regular backups help protect your business data.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for using Pointify POS!
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #10b981;">The Pointify Team</strong>
              </p>
${emailFooter}`,
  },
  {
    name: "Subscription Expiry",
    slug: "subscriptionexpiry",
    subject: "Your Pointify Subscription Expires Soon!",
    category: "reminder",
    htmlContent: `${emailHeader}
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Subscription Expiring Soon!</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>{{username}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your Pointify subscription for <strong>{{shopname}}</strong> is about to expire.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background-color: #fef3c7; border: 2px solid #f59e0b; padding: 20px 40px; border-radius: 12px;">
                  <p style="color: #92400e; font-size: 14px; margin: 0 0 5px 0;">Expires On</p>
                  <p style="color: #b45309; font-size: 24px; font-weight: bold; margin: 0;">{{expiry_date}}</p>
                </div>
              </div>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 25px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  <strong>Action Required:</strong> Renew your subscription before it expires to avoid any interruption in service.
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Don't wait until the last minute! Renew now to ensure uninterrupted access to all Pointify features.
              </p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://pointifypos.com" style="background-color: #10b981; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Renew Now</a>
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for being a valued Pointify customer!
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #10b981;">The Pointify Team</strong>
              </p>
${emailFooter}`,
  },
  {
    name: "Subscription Reminder",
    slug: "subscriptionreminder",
    subject: "Renew Your Pointify Subscription - {{days}} Days Left",
    category: "reminder",
    htmlContent: `${emailHeader}
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Subscription Renewal Reminder</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>{{username}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your Pointify subscription for <strong>{{shopname}}</strong> has expired <strong style="color: #dc2626;">{{differenceDays}} days ago</strong>.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background-color: #fef2f2; border: 2px solid #ef4444; padding: 20px 40px; border-radius: 12px;">
                  <p style="color: #991b1b; font-size: 14px; margin: 0 0 5px 0;">Time Remaining to Renew</p>
                  <p style="color: #dc2626; font-size: 36px; font-weight: bold; margin: 0;">{{days}} Days</p>
                </div>
              </div>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 25px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  <strong>Action Required:</strong> Renew your subscription now to avoid losing access to your shop data and continue managing your business seamlessly.
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Don't let your business operations be interrupted. Renew today and keep your shop running smoothly.
              </p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://pointifypos.com" style="background-color: #10b981; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Renew Subscription</a>
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for being a valued customer!
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #10b981;">The Pointify Team</strong>
              </p>
${emailFooter}`,
  },
  {
    name: "Promotion/Offer",
    slug: "promotion",
    subject: "Special Offer Just for You!",
    category: "promotion",
    htmlContent: `${emailHeader}
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Special Offer!</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>{{name}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We have an exciting offer just for you!
              </p>
              <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; padding: 25px; margin: 25px 0; text-align: center; border-radius: 8px;">
                <p style="color: #1e40af; font-size: 18px; margin: 0; font-weight: bold;">
                  {{promotionDetails}}
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Don't miss out on this limited-time opportunity to upgrade your business with Pointify POS.
              </p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://pointifypos.com" style="background-color: #10b981; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Claim Offer</a>
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #10b981;">The Pointify Team</strong>
              </p>
${emailFooter}`,
  },
  {
    name: "General Announcement",
    slug: "announcement",
    subject: "Important Update from Pointify",
    category: "announcement",
    htmlContent: `${emailHeader}
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Important Announcement</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>{{name}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We have an important update to share with you.
              </p>
              <div style="background-color: #f9fafb; padding: 25px; margin: 25px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="color: #374151; font-size: 15px; margin: 0; line-height: 1.7;">
                  {{announcementContent}}
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for being part of the Pointify community. We're committed to helping your business grow.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #10b981;">The Pointify Team</strong>
              </p>
${emailFooter}`,
  },
  {
    name: "Password Reset",
    slug: "password-reset",
    subject: "Reset Your Pointify Password",
    category: "security",
    htmlContent: `${emailHeader}
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Password Reset Request</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>{{name}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We received a request to reset your Pointify account password. Use the OTP code below to reset your password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px 40px; border-radius: 12px;">
                  <p style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">{{otp}}</p>
                </div>
              </div>
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 25px 0;">
                <p style="color: #991b1b; font-size: 14px; margin: 0;">
                  <strong>Security Notice:</strong> This OTP will expire on <strong>{{otp_expiry}}</strong>. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Enter this code in the app to create a new password. Do not share this code with anyone.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #10b981;">The Pointify Team</strong>
              </p>
${emailFooter}`,
  },
  {
    name: "Partner Earnings",
    slug: "partneraward",
    subject: "You've Earned Commission! 🎉",
    category: "promotion",
    htmlContent: `${emailHeader}
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Congratulations on Your Earnings!</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>{{referrerName}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Great news! You've earned points through the Pointify Partner Program.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px 50px; border-radius: 12px;">
                  <p style="color: #ffffff; font-size: 14px; margin: 0 0 5px 0; opacity: 0.9;">Points Earned</p>
                  <p style="color: #ffffff; font-size: 36px; font-weight: bold; margin: 0;">{{currency}} {{points}}</p>
                </div>
              </div>
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px 20px; margin: 25px 0;">
                <p style="color: #166534; font-size: 14px; margin: 0;">
                  <strong>Shop:</strong> {{shopName}}<br>
                  <strong>Owner:</strong> {{ownerName}}<br>
                  <strong>Type:</strong> {{type}}
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Keep referring new merchants to Pointify and watch your earnings grow! The more you refer, the more you earn.
              </p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://pointifypos.com" style="background-color: #10b981; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">View Dashboard</a>
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for being a valued Pointify partner!
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #10b981;">The Pointify Team</strong>
              </p>
${emailFooter}`,
  },
  {
    name: "Subscription Successful",
    slug: "subscription",
    subject: "Your Pointify Subscription is Now Active!",
    category: "welcome",
    htmlContent: `${emailHeader}
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Subscription Activated!</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>{{username}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Great news! Your Pointify subscription has been successfully activated.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px 40px; border-radius: 12px;">
                  <p style="color: #166534; font-size: 18px; font-weight: bold; margin: 0;">✓ Subscription Active</p>
                </div>
              </div>
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px 20px; margin: 25px 0;">
                <p style="color: #166534; font-size: 14px; margin: 0;">
                  <strong>Shop(s):</strong> {{shopname}}
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You now have full access to all Pointify POS features to manage your stock, sales, and cashflow from anywhere.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                <strong>What you can do now:</strong>
              </p>
              <ul style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 0 0 20px 20px; padding: 0;">
                <li>Manage products and inventory</li>
                <li>Process sales and track transactions</li>
                <li>View reports and analytics</li>
                <li>Manage multiple shops from one account</li>
              </ul>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://pointifypos.com" style="background-color: #10b981; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Start Selling</a>
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for choosing Pointify!
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #10b981;">The Pointify Team</strong>
              </p>
${emailFooter}`,
  },
  {
    name: "Password Reset Successful",
    slug: "password-reset-success",
    subject: "Your Pointify Password Has Been Reset",
    category: "security",
    htmlContent: `${emailHeader}
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Password Reset Successful</h1>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear <strong>{{name}}</strong>,
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your Pointify account password has been successfully reset.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px 40px; border-radius: 12px;">
                  <p style="color: #166534; font-size: 18px; font-weight: bold; margin: 0;">✓ Password Changed Successfully</p>
                </div>
              </div>
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 25px 0;">
                <p style="color: #991b1b; font-size: 14px; margin: 0;">
                  <strong>Didn't make this change?</strong> If you did not reset your password, please contact our support team immediately as your account may have been compromised.
                </p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                You can now log in to your account using your new password.
              </p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://pointifypos.com" style="background-color: #10b981; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Login Now</a>
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Best regards,<br>
                <strong style="color: #10b981;">The Pointify Team</strong>
              </p>
${emailFooter}`,
  },
];

const categoryColors: Record<string, string> = {
  welcome: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  reminder: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  promotion: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  announcement: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  security: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  custom: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [editDialog, setEditDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await apiClient<EmailTemplate[]>("/templates");
      setTemplates(response || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate({
      name: "",
      slug: "",
      subject: "",
      htmlContent: emailHeader + "\n              <!-- Your content here -->\n" + emailFooter,
      category: "custom",
      placeholders: ["name", "email"],
      isDefault: false,
      isActive: true,
    });
    setEditDialog(true);
  };

  const handleUseStarter = (starter: typeof starterTemplates[0]) => {
    setEditingTemplate({
      name: starter.name,
      slug: starter.slug,
      subject: starter.subject,
      htmlContent: starter.htmlContent,
      category: starter.category,
      placeholders: ["name", "email", "expiryDate", "shopName"],
      isDefault: true,
      isActive: true,
    });
    setEditDialog(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
    setEditDialog(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewDialog(true);
  };

  const handleSave = async () => {
    if (!editingTemplate?.name || !editingTemplate?.subject || !editingTemplate?.htmlContent) {
      toast({
        title: "Missing fields",
        description: "Please fill in name, subject, and content.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const slug = editingTemplate.slug || editingTemplate.name.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        name: editingTemplate.name,
        slug,
        subject: editingTemplate.subject,
        htmlContent: editingTemplate.htmlContent,
        category: editingTemplate.category || "custom",
        placeholders: editingTemplate.placeholders || ["name", "email"],
        isDefault: editingTemplate.isDefault || false,
        isActive: editingTemplate.isActive !== false,
      };

      if (editingTemplate._id) {
        await apiClient(`/templates/${editingTemplate._id}`, {
          method: "PUT",
          body: payload,
        });
        toast({ title: "Template updated" });
      } else {
        await apiClient("/templates", {
          method: "POST",
          body: payload,
        });
        toast({ title: "Template created" });
      }

      setEditDialog(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient(`/templates/${id}`, { method: "DELETE" });
      toast({ title: "Template deleted" });
      setDeleteDialog(null);
      fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Email Templates">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Email Templates</h2>
            <p className="text-muted-foreground">Create and manage email templates for bulk communication</p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {templates.length === 0 && !loading && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Get Started with Starter Templates</CardTitle>
              <CardDescription>
                Choose from our pre-designed templates to quickly set up your email communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {starterTemplates.map((starter, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{starter.name}</h3>
                        <p className="text-sm text-muted-foreground">{starter.subject}</p>
                      </div>
                      <Badge className={categoryColors[starter.category]}>
                        {starter.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPreviewTemplate({
                            ...starter,
                            _id: "",
                            placeholders: [],
                            isDefault: true,
                            isActive: true,
                          });
                          setPreviewDialog(true);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUseStarter(starter)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge className={categoryColors[template.category] || categoryColors.custom}>
                        {template.category}
                      </Badge>
                      {template.isDefault && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-1">{template.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handlePreview(template)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteDialog(template._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}

        {templates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add More Templates</CardTitle>
              <CardDescription>Use starter templates as a base for new emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {starterTemplates.map((starter, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleUseStarter(starter)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {starter.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate?._id ? "Edit Template" : "Create Template"}
              </DialogTitle>
              <DialogDescription>
                Fill in the template details. Use placeholders like {"{{name}}"} for personalization.
              </DialogDescription>
            </DialogHeader>
            
            {editingTemplate && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      value={editingTemplate.name || ""}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      placeholder="e.g., Welcome Email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editingTemplate.category || "custom"}
                      onValueChange={(v) => setEditingTemplate({ ...editingTemplate, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <Input
                    value={editingTemplate.subject || ""}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    placeholder="e.g., Welcome to Pointify POS!"
                  />
                </div>

                <div className="space-y-2">
                  <Label>HTML Content</Label>
                  <Textarea
                    value={editingTemplate.htmlContent || ""}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, htmlContent: e.target.value })}
                    rows={15}
                    className="font-mono text-sm"
                    placeholder="Enter HTML email content..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Available placeholders: {"{{name}}"}, {"{{email}}"}, {"{{expiryDate}}"}, {"{{shopName}}"}, {"{{promotionDetails}}"}, {"{{announcementContent}}"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editingTemplate.isDefault || false}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, isDefault: e.target.checked })}
                      className="rounded"
                    />
                    Mark as default template
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editingTemplate.isActive !== false}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                      className="rounded"
                    />
                    Active (visible in dropdown)
                  </label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
              <DialogDescription>Subject: {previewTemplate?.subject}</DialogDescription>
            </DialogHeader>
            <div className="border rounded-md overflow-auto max-h-[60vh] bg-gray-100">
              <iframe
                srcDoc={previewTemplate?.htmlContent
                  ?.replace(/\{\{name\}\}/g, "John Doe")
                  .replace(/\{\{email\}\}/g, "john@example.com")
                  .replace(/\{\{expiryDate\}\}/g, "January 15, 2025")
                  .replace(/\{\{shopName\}\}/g, "John's Shop")
                  .replace(/\{\{promotionDetails\}\}/g, "50% OFF on all subscriptions!")
                  .replace(/\{\{announcementContent\}\}/g, "We have exciting new features coming soon!")}
                title="Email Preview"
                className="w-full h-[500px] border-0"
                sandbox="allow-same-origin"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this template? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => deleteDialog && handleDelete(deleteDialog)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
