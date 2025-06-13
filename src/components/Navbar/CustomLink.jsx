import React from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';

export default function CustomLink({ to, children, onClick, ...props }) {
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true });

    return (
        <li className={`nav-item ${isActive ? "active" : ""}`}>
            <Link to={to} className="nav-link" onClick={onClick} {...props}>
                {children}
            </Link>
        </li>
    );
}
