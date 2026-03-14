import { ReactNode } from 'react';

   interface LayoutProps {
     title: string;
     children: ReactNode;
   }

   export default function Layout({ title, children }: LayoutProps) {
     return (
       <div>
         <head>
           <title>{title}</title>
           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
         </head>
         <main>{children}</main>
       </div>
     );
   }