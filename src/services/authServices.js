// src/services/authServices.js

// Keys for localStorage
const USERS_KEY = "invoiceflow_users";
const LOGGEDIN_KEY = "invoiceflow_loggedInUser";
const INVOICES_KEY = "invoiceflow_invoices";

// Initialize admin user if not exists
function initAdmin() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const adminExists = users.find(u => u.email === "admin@invoiceflow.com");
  
  if (!adminExists) {
    const adminUser = {
      id: "admin_001",
      firstName: "Admin",
      lastName: "User",
      email: "admin@invoiceflow.com",
      password: "admin123",
      phoneNumber: "+1 (555) 123-4567",
      sex: "Male",
      country: "United States",
      currencyCode: "USD",
      currencySymbol: "$",
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(adminUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

initAdmin();

// ------------------- User/Auth functions -------------------

// Register new user (NO auto-login)
export function registerUser(userData) {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    
    // Check if user already exists
    const userExists = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (userExists) {
      return { success: false, message: "User already exists with this email" };
    }

    // Create new user object
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to users array
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // DO NOT auto login - user must login manually
    return { success: true, user: newUser };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Registration failed. Please try again." };
  }
}

// Login user with specific error messages
export function loginUser(email, password) {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    
    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check password
    if (user.password !== password) {
      return { success: false, message: "Incorrect password" };
    }

    // Store logged in user
    localStorage.setItem(LOGGEDIN_KEY, JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Login failed. Please try again." };
  }
}

// Get current logged in user
export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem(LOGGEDIN_KEY));
    return user || null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// Logout user
export function logoutUser() {
  localStorage.removeItem(LOGGEDIN_KEY);
  return { success: true };
}

// Check if user is authenticated
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

// Check if user is admin
export function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === "admin";
}

// Update user profile
export function updateUserProfile(userId, updates) {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: "User not found" };
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(LOGGEDIN_KEY, JSON.stringify(users[userIndex]));
    }

    return { success: true, user: users[userIndex] };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

// Get all users (admin only)
export function getAllUsers() {
  try {
    if (!isAdmin()) {
      return { success: false, message: "Unauthorized" };
    }
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    return { success: true, users };
  } catch (error) {
    console.error("Get all users error:", error);
    return { success: false, message: "Failed to get users" };
  }
}

// ------------------- Invoice functions -------------------

// Get all invoices for current user
export function getInvoices() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return [];
    }
    
    const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
    
    // Filter invoices by user (admin sees all)
    if (currentUser.role === "admin") {
      return invoices;
    }
    
    return invoices.filter(invoice => invoice.userId === currentUser.id);
  } catch (error) {
    console.error("Get invoices error:", error);
    return [];
  }
}

// Create new invoice
export function createInvoice(invoiceData) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "User not authenticated" };
    }

    const invoices = getInvoices();
    const newInvoice = {
      id: `inv_${Date.now()}`,
      ...invoiceData,
      userId: currentUser.id,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending"
    };

    invoices.push(newInvoice);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    
    return { success: true, invoice: newInvoice };
  } catch (error) {
    console.error("Create invoice error:", error);
    return { success: false, message: "Failed to create invoice" };
  }
}

// Update invoice
export function updateInvoice(invoiceId, updates) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "User not authenticated" };
    }

    const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    
    if (invoiceIndex === -1) {
      return { success: false, message: "Invoice not found" };
    }

    // Check permissions (admin or owner)
    const invoice = invoices[invoiceIndex];
    if (currentUser.role !== "admin" && invoice.userId !== currentUser.id) {
      return { success: false, message: "Unauthorized" };
    }

    invoices[invoiceIndex] = {
      ...invoice,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    
    return { success: true, invoice: invoices[invoiceIndex] };
  } catch (error) {
    console.error("Update invoice error:", error);
    return { success: false, message: "Failed to update invoice" };
  }
}

// Delete invoice
export function deleteInvoice(invoiceId) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "User not authenticated" };
    }

    const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    
    if (invoiceIndex === -1) {
      return { success: false, message: "Invoice not found" };
    }

    // Check permissions (admin or owner)
    const invoice = invoices[invoiceIndex];
    if (currentUser.role !== "admin" && invoice.userId !== currentUser.id) {
      return { success: false, message: "Unauthorized" };
    }

    invoices.splice(invoiceIndex, 1);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    
    return { success: true };
  } catch (error) {
    console.error("Delete invoice error:", error);
    return { success: false, message: "Failed to delete invoice" };
  }
}

// Get invoice by ID
export function getInvoiceById(invoiceId) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return null;
    }

    const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
    const invoice = invoices.find(inv => inv.id === invoiceId);
    
    if (!invoice) {
      return null;
    }

    // Check permissions (admin or owner)
    if (currentUser.role !== "admin" && invoice.userId !== currentUser.id) {
      return null;
    }

    return invoice;
  } catch (error) {
    console.error("Get invoice by ID error:", error);
    return null;
  }
}