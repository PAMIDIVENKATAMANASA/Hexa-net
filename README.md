# Campus Net Planner

A comprehensive network planning application for colleges and universities that automates the creation of logical network designs with role-based access control.

## Features

- **Multi-Role System**: Support for 4 distinct user roles (Client, Web Admin, Network Designer, Network Installation Team)
- **Automated Design Generation**: AI-powered backend engine that processes requirements to generate complete logical designs
- **Visual Network Topology**: Interactive Mermaid.js diagrams showing network architecture
- **IP Planning & VLAN Management**: Automated subnet calculation and VLAN assignment
- **Bill of Materials**: Comprehensive hardware requirements and cost analysis
- **Request Management**: Complete workflow from request submission to installation completion
- **Device Catalog**: Admin-managed hardware inventory system

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication with bcryptjs
- **ip-subnet-calculator** for IP planning
- **Mermaid.js** for diagram generation

### Frontend
- **Next.js** 14 with React 18
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Hook Form** for form management
- **React Hot Toast** for notifications

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-net-planner
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/campus-net-planner
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   ```

   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## Usage

### User Roles

1. **Client (College Administrator)**
   - Submit detailed network design requests
   - View status of submitted requests
   - Access generated design reports

2. **Web Admin**
   - Manage all requests in the system
   - Assign requests to designers and installers
   - Manage device catalog
   - View system statistics

3. **Network Designer**
   - View assigned requests
   - Generate automated network designs
   - Review and approve generated designs
   - Access design reports and documentation

4. **Network Installation Team**
   - View assigned installation projects
   - Access design specifications
   - Update installation progress
   - Mark projects as complete

### Request Submission Process

1. **Client submits request** with detailed requirements:
   - Campus information
   - Department structure
   - Room-by-room host counts (wired/wireless)
   - Additional requirements

2. **Web Admin assigns** the request to a Network Designer

3. **Network Designer generates** the logical design:
   - Automated hardware calculation
   - IP subnet planning
   - VLAN assignment
   - Network topology diagram

4. **Designer reviews and approves** the generated design

5. **Web Admin assigns** to Network Installation Team

6. **Installation Team** implements the design

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Requests
- `POST /api/requests` - Create new request (Client only)
- `GET /api/requests` - Get requests (role-based filtering)
- `GET /api/requests/:id` - Get specific request
- `PUT /api/requests/:id/assign` - Assign request (Admin only)
- `PUT /api/requests/:id/status` - Update request status

### Admin
- `GET /api/admin/devices` - Get device catalog
- `POST /api/admin/devices` - Create device (Admin only)
- `PUT /api/admin/devices/:id` - Update device (Admin only)
- `DELETE /api/admin/devices/:id` - Delete device (Admin only)
- `GET /api/admin/users` - Get users (Admin only)
- `GET /api/admin/stats` - Get system statistics

### Designs
- `POST /api/designs/generate/:requestId` - Generate design (Designer only)
- `GET /api/designs/:id` - Get specific design
- `GET /api/designs/request/:requestId` - Get design by request
- `PUT /api/designs/:id/approve` - Approve design (Designer only)

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Seeding
To populate the device catalog with sample data, you can create a seeding script or manually add devices through the admin interface.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
