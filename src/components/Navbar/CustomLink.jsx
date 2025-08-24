// import React from 'react';
// import { Link, useMatch, useResolvedPath } from 'react-router-dom';

// export default function CustomLink({ to, children, onClick, ...props }) {
//     const resolvedPath = useResolvedPath(to);
//     const isActive = useMatch({ path: resolvedPath.pathname, end: true });

//     return (
//         <li className={`nav-item ${isActive ? "active" : ""}`}>
//             <Link to={to} className="nav-link" onClick={onClick} {...props}>
//                 {children}
//             </Link>
//         </li>
//     );
// }

import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { Button } from "@mui/material";

export default function CustomLink({ to, children, onClick, activePaths = [], ...props }) {
  // Always call the hooks
  const resolvedPath = useResolvedPath(to || "/"); // default to "/" if no `to`
  const match = useMatch({ path: resolvedPath.pathname, end: true });

  // Only consider activePaths if they are non-empty
  const isActive =
    (to && match) ||
    (activePaths.length > 0 &&
      activePaths.some((path) => path && window.location.pathname === path));

  return (
    <Button
      component={to ? Link : "button"}
      to={to || undefined}
      onClick={onClick}
      {...props}
      sx={{
        color: isActive ? "primary.main" : "text.primary",
        fontWeight: isActive ? "bold" : "normal",
        textTransform: "none",
        mx: 1,
        "&:hover": {
          bgcolor: "transparent",
          color: "primary.dark",
        },
      }}
    >
      {children}
    </Button>
  );
}
