import '../styles/globals.css';

export const metadata = {
    title: {
        template: '%s | Qualifirst',
        default: '',
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body className="antialiased">
                <main className="flex justify-center">{children}</main>
            </body>
        </html>
    );
}
