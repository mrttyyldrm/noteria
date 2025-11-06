<div align="center">
<img width="1200" height="450" alt="1281" src="https://github.com/user-attachments/assets/99615f51-8f38-4996-8ef6-0960d0c860f9" />
  
  # Noteria
  ### Kosovo's AI-Powered Notary Application
  *Developed by [Zhvillo®](https://zhvillo.com)*  
</div>

## Description

**Noteria** is a cutting-edge, AI-powered notary application designed specifically for legal professionals in Kosovo. Built with modern web technologies, Noteria streamlines notarial workflows by combining intelligent document management, comprehensive court decisions tracking, and robust user administration in a single, intuitive platform.

### Target Users

- **Notaries** - Manage documents, track court decisions, and handle client information efficiently
- **Legal Professionals** - Access court decisions database and document management tools
- **Office Administrators** - Oversee user management, permissions, and system operations

## Features

### Document Management

- **Upload & Storage** - Secure document upload with cloud storage integration
- **Document Editor** - Built-in editor for creating and modifying documents
- **Version Control** - Track document changes with complete version history
- **Search & Filter** - AI-powered search to find documents instantly
- **Document Comparison** - Side-by-side comparison of document versions
- **Drag & Drop** - Intuitive dropzone interface for easy file uploads
- **Multi-format Support** - Handle various document formats (PDF, DOCX, etc.)

### Court Decisions

- **Comprehensive Database** - Access and manage court decisions
- **Smart Search** - Filter by date, court, case type, and keywords
- **Decision Analytics** - Visualize trends and patterns in court decisions
- **Export & Share** - Generate reports and share decisions with stakeholders

### User Management

- **Secure Login** - Industry-standard authentication and authorization
- **Role-Based Access Control** - Granular permissions for different user types
- **User Profiles** - Detailed profile management for each user
- **Password Reset** - Secure password recovery via email
- **Activity Logs** - Track user actions and system access

### AI Integration

- **Document Analysis** - AI-powered document classification and extraction
- **Smart Suggestions** - Intelligent recommendations and alerts based on document context

## 📁 Project Structure

```
notary/
├── public/                              # Static assets (images, icons, logos)
├── src/                                 # Project source codes
│   ├── app/                             # Next.js App Router pages and layouts
│   │   ├── auth/                        # Authentication pages
│   │   ├── dashboard/                   # Main dashboard and features
│   │   │   ├── compare/                 # Document comparison
│   │   │   ├── court-decisions/         # Court decisions module
│   │   │   ├── document-management/     # Document management module
│   │   │   ├── person/                  # Person profiles
│   │   │   └── user-management/         # User managemement module
│   ├── components/                      # Reusable React components
│   │   └── ui/                          # UI component library
│   ├── context/                         # React Context providers
│   ├── hooks/                           # Custom React hooks
│   └── lib/                             # Utility functions and helpers
├── components.json                      # shadcn/ui configuration
├── next.config.ts                       # Next.js configuration
├── tailwind.config.ts                   # Tailwind CSS configuration
└── tsconfig.json                        # TypeScript configuration
```

## License

This project is proprietary software developed by **Zhvillo®**. All rights reserved.

For licensing inquiries, please contact [Zhvillo®](mailto:info@zhvillo.com).
