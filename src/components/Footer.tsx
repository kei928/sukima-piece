export default function Footer() {
  const currentYear = new Date().getFullYear(); // 現在の年を取得

  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-gray-500">
        <p>&copy; {currentYear} Sukima Piece. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
