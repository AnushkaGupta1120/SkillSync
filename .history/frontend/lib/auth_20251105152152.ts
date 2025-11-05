register: async (data) => {
  set({ isLoading: true, error: null });
  try {
    const response = await authAPI.register({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'student'
    });

    const { user, accessToken } = response.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    set({ user, token: accessToken, isLoading: false });
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || 'Registration failed';
    set({ error: errorMsg, isLoading: false });
    throw error;
  }
},
