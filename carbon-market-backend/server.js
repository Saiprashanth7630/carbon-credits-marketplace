// POST /api/auth/signin route
router.post('/auth/signin', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  
      // Normally you’d use JWT, but here we send back basic user info
      res.status(200).json({
        message: 'Login successful',
        user: {
          fullName: user.fullName,
          email: user.email,
          organization: user.organization,
          role: user.role,
          location: user.location,
          creditType: user.creditType
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });
  