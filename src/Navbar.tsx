import Logo from './Logo';

const Navbar = () => (
  <nav className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-lime-200 via-yellow-100 to-orange-200 shadow-lg rounded-b-2xl border-b border-orange-300">
    <div className="flex items-center gap-3">
      <Logo />
    </div>
    <a
      href="/logout"
      className="inline-block bg-gradient-to-r from-orange-400 to-red-400 text-white font-semibold px-5 py-2 rounded-full shadow hover:from-orange-500 hover:to-red-500 transition-all border-2 border-orange-300"
    >
      Logout
    </a>
  </nav>
);

export default Navbar; 