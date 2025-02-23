import React from 'react';

const Pagination = () => {
  return <div>Pagination</div>;
};

export default Pagination;

// import React from 'react';
// import {
//   Pagination as PaginationRoot,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '~/components/ui/pagination';

// export interface Props {
//   prevUrl?: string;
//   nextUrl?: string;
//   currentPage?: number;
//   totalPages?: number;
//   baseUrl?: string;
// }

// const SIBLING_COUNT = 1;
// const BOUNDARY_COUNT = 1;

// const Pagination: React.FC<Props> = ({ prevUrl, nextUrl, currentPage = 1, totalPages = 1, baseUrl = '' }) => {
//   const getPageUrl = (page: number): string => {
//     if (page === 1) return baseUrl;
//     return `${baseUrl}/${page}`;
//   };

//   const range = (start: number, end: number): number[] => {
//     const length = end - start + 1;
//     return Array.from({ length }, (_, i) => start + i);
//   };

//   const renderPaginationItems = (): React.ReactNode[] => {
//     const items: React.ReactNode[] = [];

//     // Calculate range of pages to show
//     const startPages = range(1, Math.min(BOUNDARY_COUNT, totalPages));
//     const endPages = range(Math.max(totalPages - BOUNDARY_COUNT + 1, BOUNDARY_COUNT + 1), totalPages);
//     const siblingStart = Math.max(
//       Math.min(currentPage - SIBLING_COUNT, totalPages - BOUNDARY_COUNT - SIBLING_COUNT * 2 - 1),
//       BOUNDARY_COUNT + 2
//     );
//     const siblingEnd = Math.min(
//       Math.max(currentPage + SIBLING_COUNT, BOUNDARY_COUNT + SIBLING_COUNT * 2 + 2),
//       endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
//     );

//     // Add first pages
//     startPages.forEach((page) => {
//       items.push(
//         <PaginationItem key={page}>
//           <PaginationLink href={getPageUrl(page)} isActive={page === currentPage}>
//             {page}
//           </PaginationLink>
//         </PaginationItem>
//       );
//     });

//     // Add ellipsis if needed
//     if (siblingStart > BOUNDARY_COUNT + 2) {
//       items.push(
//         <PaginationItem key="ellipsis-1">
//           <PaginationEllipsis />
//         </PaginationItem>
//       );
//     } else if (BOUNDARY_COUNT + 1 < totalPages - BOUNDARY_COUNT) {
//       items.push(
//         <PaginationItem key={BOUNDARY_COUNT + 1}>
//           <PaginationLink href={getPageUrl(BOUNDARY_COUNT + 1)} isActive={BOUNDARY_COUNT + 1 === currentPage}>
//             {BOUNDARY_COUNT + 1}
//           </PaginationLink>
//         </PaginationItem>
//       );
//     }

//     // Add sibling pages
//     range(siblingStart, siblingEnd).forEach((page) => {
//       items.push(
//         <PaginationItem key={page}>
//           <PaginationLink href={getPageUrl(page)} isActive={page === currentPage}>
//             {page}
//           </PaginationLink>
//         </PaginationItem>
//       );
//     });

//     // Add ellipsis if needed
//     if (siblingEnd < totalPages - BOUNDARY_COUNT - 1) {
//       items.push(
//         <PaginationItem key="ellipsis-2">
//           <PaginationEllipsis />
//         </PaginationItem>
//       );
//     } else if (totalPages - BOUNDARY_COUNT > BOUNDARY_COUNT) {
//       items.push(
//         <PaginationItem key={totalPages - BOUNDARY_COUNT}>
//           <PaginationLink
//             href={getPageUrl(totalPages - BOUNDARY_COUNT)}
//             isActive={totalPages - BOUNDARY_COUNT === currentPage}
//           >
//             {totalPages - BOUNDARY_COUNT}
//           </PaginationLink>
//         </PaginationItem>
//       );
//     }

//     // Add last pages
//     endPages.forEach((page) => {
//       items.push(
//         <PaginationItem key={page}>
//           <PaginationLink href={getPageUrl(page)} isActive={page === currentPage}>
//             {page}
//           </PaginationLink>
//         </PaginationItem>
//       );
//     });

//     return items;
//   };

//   if (totalPages <= 1) return null;

//   return (
//     <PaginationRoot>
//       <PaginationContent className="hidden lg:flex">
//         <PaginationItem>
//           <PaginationPrevious href={prevUrl} aria-disabled={!prevUrl} />
//         </PaginationItem>
//         {renderPaginationItems()}
//         <PaginationItem>
//           <PaginationNext href={nextUrl} aria-disabled={!nextUrl} />
//         </PaginationItem>
//       </PaginationContent>
//       {/* 小屏不显示完整页码 */}
//       <PaginationContent className="flex lg:hidden">
//         <PaginationItem>
//           <PaginationPrevious href={prevUrl} aria-disabled={!prevUrl} />
//         </PaginationItem>
//         <PaginationItem>
//           <PaginationNext href={nextUrl} aria-disabled={!nextUrl} />
//         </PaginationItem>
//       </PaginationContent>
//     </PaginationRoot>
//   );
// };

// export default Pagination;
