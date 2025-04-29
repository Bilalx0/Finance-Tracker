import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  InputBase, 
  Badge,
  Drawer,
  Box,
  alpha,
  styled
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Custom styled search component
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const ShortcutKey = styled('span')(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(1.5),
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  padding: '2px 4px',
  borderRadius: '4px',
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearchDrawer = (open: boolean) => {
    setIsSearchOpen(open);
  };

  return (
    <AppBar position="sticky" color='#121833' elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            fontWeight: 600,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Finance Budget Tracker
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Desktop Search */}
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon fontSize="small" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search"
              inputProps={{ 'aria-label': 'search' }}
            />
            <ShortcutKey>
              ⌘K
            </ShortcutKey>
          </Search>
        </Box>
        
        {/* Mobile Search Icon */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton 
            size="large" 
            aria-label="search" 
            onClick={() => toggleSearchDrawer(true)}
          >
            <SearchIcon />
          </IconButton>
        </Box>
        
        <IconButton size="large" aria-label="show notifications" color="inherit">
          <Badge color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        <IconButton size="large" aria-label="show messages" color="inherit">
          <Badge color="error">
            <MessageIcon />
          </Badge>
        </IconButton>
      </Toolbar>
      
      {/* Mobile Search Drawer */}
      <Drawer
        anchor="top"
        open={isSearchOpen}
        onClose={() => toggleSearchDrawer(false)}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Search</Typography>
            <IconButton onClick={() => toggleSearchDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Search>
            <SearchIconWrapper>
              <SearchIcon fontSize="small" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search"
              inputProps={{ 'aria-label': 'search' }}
              autoFocus
              fullWidth
            />
          </Search>
        </Box>
      </Drawer>
    </AppBar>
  );
}