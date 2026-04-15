"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
    Breadcrumb, 
    BreadcrumbItem, 
    BreadcrumbLink, 
    BreadcrumbList, 
    BreadcrumbPage, 
    BreadcrumbSeparator 
} from '../ui/breadcrumb';

const BreadHeader = () => {
    const pathname = usePathname();
    
    // Split path into segments and remove empty strings
    const segments = pathname.split('/').filter(Boolean);
    
    // Build cumulative paths for each segment
    const breadcrumbs = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        // Decode URL-encoded segments (e.g., %20 -> space)
        const label = decodeURIComponent(segment);
        // Check if this is the last segment (current page)
        const isLast = index === segments.length - 1;
        
        return { href, label, isLast };
    });

    // Don't render if on home page
    if (segments.length === 0) return null;

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {segments.length > 0 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                )}
                
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                        <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                            {crumb.isLast ? (
                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={crumb.href}>{crumb.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!crumb.isLast && (
                            <BreadcrumbSeparator className="hidden md:block" />
                        )}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default BreadHeader;