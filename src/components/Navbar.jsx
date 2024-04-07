import Link from "next/link";


export default function Navbar() {
    return(
        <nav>
            <Link href="/">Home</Link>
            <Link href="/events">Events</Link>
            <Link href="/tickets">My tickets</Link>
        </nav>
    )
}