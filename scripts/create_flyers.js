const sharp = require('sharp');
const path = require('path');

async function createFlyers() {
  const baseDir = path.join(__dirname, '..', 'public');
  const prodDir = path.join(baseDir, 'images', 'productos');
  const logoPath = path.join(baseDir, 'logo-suavecito.png');

  const width = 800;
  const height = 1350;

  // Prepare photo 1
  const photo1Buffer = await sharp(path.join(prodDir, 'producto1.jpg'))
    .resize(720, 640, { fit: 'cover' })
    .toBuffer();

  // Prepare photo 2
  const photo2Buffer = await sharp(path.join(prodDir, 'producto2.jpg'))
    .resize(720, 640, { fit: 'cover' })
    .toBuffer();

  // Prepare photo 3
  const photo3Buffer = await sharp(path.join(prodDir, 'producto3.jpg'))
    .resize(720, 640, { fit: 'cover' })
    .toBuffer();

  // Prepare SUAVECITO logo buffer
  const logoBuffer = await sharp(logoPath)
    .resize(260, 85, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // --- FLYER A (Marca Ficticia 1: NIDITO - Bs. 120) ---
  const svgOverlay1 = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="#FDFCFA" stroke="#E2E8F0" stroke-width="2"/>
    
    <!-- Top Bar: Fictitious Brand Logo 1 -->
    <rect x="40" y="32" width="130" height="38" rx="10" fill="#E2E8F0"/>
    <text x="105" y="57" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#475569" text-anchor="middle">DISEÑO A</text>
    
    <!-- Logo Ficticio: NIDITO BEBÉ -->
    <g transform="translate(560, 28)">
      <circle cx="20" cy="22" r="16" fill="#3B82F6"/>
      <path d="M12 24 Q20 12 28 24" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="20" cy="18" r="4" fill="#FFFFFF"/>
      <text x="44" y="22" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#1E3A8A">NIDITO</text>
      <text x="44" y="34" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#64748B" letter-spacing="1.5">ROPA DE BEBÉ</text>
    </g>

    <!-- Photo Container -->
    <rect x="40" y="92" width="720" height="640" rx="24" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1"/>

    <!-- Product Title -->
    <text x="40" y="785" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#1E293B">Conjunto Básico de Ropa Tejida</text>
    <text x="40" y="820" font-family="system-ui, sans-serif" font-size="19" font-weight="500" fill="#64748B">2 prendas: Chambrita y buzo</text>

    <!-- Price Box -->
    <rect x="40" y="855" width="720" height="96" rx="20" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="70" y="915" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#64748B">Precio regular:</text>
    <text x="450" y="918" font-family="system-ui, sans-serif" font-size="38" font-weight="900" fill="#0F172A">Bs. 120.00</text>

    <!-- Divider -->
    <line x1="40" y1="985" x2="760" y2="985" stroke="#E2E8F0" stroke-width="1.5"/>

    <!-- Section: Características (Pocas y breves) -->
    <text x="40" y="1030" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#475569" letter-spacing="1.5">CARACTERÍSTICAS DEL PRODUCTO</text>

    <!-- Feature 1 -->
    <g transform="translate(40, 1055)">
      <circle cx="20" cy="20" r="14" fill="#E2E8F0"/>
      <text x="20" y="25" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#334155" text-anchor="middle">✓</text>
      <text x="50" y="26" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#1E293B">Chambrita tejida</text>
    </g>

    <!-- Feature 2 -->
    <g transform="translate(40, 1120)">
      <circle cx="20" cy="20" r="14" fill="#E2E8F0"/>
      <text x="20" y="25" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#334155" text-anchor="middle">✓</text>
      <text x="50" y="26" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#1E293B">Buzo cómodo</text>
    </g>

    <!-- Feature 3 -->
    <g transform="translate(40, 1185)">
      <circle cx="20" cy="20" r="14" fill="#E2E8F0"/>
      <text x="20" y="25" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#334155" text-anchor="middle">✓</text>
      <text x="50" y="26" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#1E293B">Material suave</text>
    </g>

    <!-- Note bottom -->
    <text x="40" y="1285" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="#94A3B8">Presentación sencilla • 2 prendas tejidas • Sin accesorios</text>
  </svg>
  `;

  await sharp(Buffer.from(svgOverlay1))
    .composite([
      { input: photo1Buffer, top: 92, left: 40 }
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(prodDir, 'diseno1.jpg'));

  console.log('Flyer A created successfully');

  // --- FLYER B (Marca Ficticia 2: TEJIDITOS ECONÓMICOS - Bs. 90) ---
  const svgOverlay2 = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
    
    <!-- Top Bar: Fictitious Brand Logo 2 -->
    <rect x="40" y="32" width="130" height="38" rx="10" fill="#FEF3C7"/>
    <text x="105" y="57" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#B45309" text-anchor="middle">DISEÑO B</text>
    
    <!-- Logo Ficticio: LANA EXPRESS / TEJIDITOS -->
    <g transform="translate(535, 28)">
      <rect x="0" y="6" width="32" height="32" rx="8" fill="#F59E0B"/>
      <text x="16" y="28" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle">T</text>
      <text x="40" y="23" font-family="system-ui, sans-serif" font-size="18" font-weight="900" fill="#B45309">TEJIDITOS</text>
      <text x="40" y="35" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#78350F" letter-spacing="1">LÍNEA BÁSICA</text>
    </g>

    <!-- Photo Container -->
    <rect x="40" y="92" width="720" height="640" rx="24" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1"/>

    <!-- Product Title -->
    <text x="40" y="785" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#1E293B">Conjunto de Ropa para Bebé</text>
    <text x="40" y="820" font-family="system-ui, sans-serif" font-size="19" font-weight="500" fill="#64748B">3 prendas: Chambrita, buzo y gorrito</text>

    <!-- Price Box -->
    <rect x="40" y="855" width="720" height="96" rx="20" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1.5"/>
    <text x="70" y="915" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#92400E">Precio económico:</text>
    <text x="470" y="918" font-family="system-ui, sans-serif" font-size="38" font-weight="900" fill="#B45309">Bs. 90.00</text>

    <!-- Divider -->
    <line x1="40" y1="985" x2="760" y2="985" stroke="#E2E8F0" stroke-width="1.5"/>

    <!-- Section: Características -->
    <text x="40" y="1025" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#475569" letter-spacing="1.5">CARACTERÍSTICAS DEL PRODUCTO</text>

    <!-- Feature 1 -->
    <g transform="translate(40, 1045)">
      <circle cx="20" cy="18" r="13" fill="#FEF3C7"/>
      <text x="20" y="23" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#B45309" text-anchor="middle">✓</text>
      <text x="50" y="24" font-family="system-ui, sans-serif" font-size="19" font-weight="600" fill="#1E293B">Chambrita tejida</text>
    </g>

    <!-- Feature 2 -->
    <g transform="translate(40, 1095)">
      <circle cx="20" cy="18" r="13" fill="#FEF3C7"/>
      <text x="20" y="23" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#B45309" text-anchor="middle">✓</text>
      <text x="50" y="24" font-family="system-ui, sans-serif" font-size="19" font-weight="600" fill="#1E293B">Buzo cómodo</text>
    </g>

    <!-- Feature 3 -->
    <g transform="translate(40, 1145)">
      <circle cx="20" cy="18" r="13" fill="#FEF3C7"/>
      <text x="20" y="23" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#B45309" text-anchor="middle">✓</text>
      <text x="50" y="24" font-family="system-ui, sans-serif" font-size="19" font-weight="600" fill="#1E293B">Gorrito incluido</text>
    </g>

    <!-- Feature 4 -->
    <g transform="translate(40, 1195)">
      <circle cx="20" cy="18" r="13" fill="#FEE2E2"/>
      <text x="20" y="23" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#B91C1C" text-anchor="middle">!</text>
      <text x="50" y="24" font-family="system-ui, sans-serif" font-size="19" font-weight="600" fill="#B91C1C">Tejido sintético básico económico</text>
    </g>

    <!-- Feature 5 -->
    <g transform="translate(40, 1245)">
      <circle cx="20" cy="18" r="13" fill="#FEF3C7"/>
      <text x="20" y="23" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#B45309" text-anchor="middle">✓</text>
      <text x="50" y="24" font-family="system-ui, sans-serif" font-size="19" font-weight="600" fill="#1E293B">Diseño básico</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svgOverlay2))
    .composite([
      { input: photo2Buffer, top: 92, left: 40 }
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(prodDir, 'diseno2.jpg'));

  console.log('Flyer B created successfully');

  // --- FLYER C (SUAVECITO OFICIAL - Bs. 150) ---
  const svgOverlay3 = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="#FAF8F5" stroke="#9CA986" stroke-width="2.5"/>
    
    <!-- Header Badge -->
    <rect x="40" y="32" width="130" height="38" rx="10" fill="#E8EDE1"/>
    <text x="105" y="57" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#4B5E39" text-anchor="middle">DISEÑO C</text>
    
    <!-- Photo Container -->
    <rect x="40" y="104" width="720" height="640" rx="24" fill="#F7F5F0" stroke="#E8EDE1" stroke-width="1.5"/>

    <!-- Product Title & Layette Items -->
    <text x="40" y="785" font-family="system-ui, sans-serif" font-size="32" font-weight="900" fill="#1F2937">Conjunto Completo Coordinado</text>
    
    <!-- Included items pill badges -->
    <g transform="translate(40, 805)">
      <rect x="0" y="0" width="112" height="28" rx="8" fill="#E8EDE1"/>
      <text x="56" y="19" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#4B5E39" text-anchor="middle">Chambrita</text>

      <rect x="120" y="0" width="80" height="28" rx="8" fill="#E8EDE1"/>
      <text x="160" y="19" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#4B5E39" text-anchor="middle">Buzo</text>

      <rect x="208" y="0" width="82" height="28" rx="8" fill="#E8EDE1"/>
      <text x="249" y="19" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#4B5E39" text-anchor="middle">Gorro</text>

      <rect x="298" y="0" width="92" height="28" rx="8" fill="#E8EDE1"/>
      <text x="344" y="19" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#4B5E39" text-anchor="middle">Babero</text>

      <rect x="398" y="0" width="170" height="28" rx="8" fill="#E8EDE1"/>
      <text x="483" y="19" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#4B5E39" text-anchor="middle">Zapatitos tejidos</text>
    </g>

    <!-- Price Box -->
    <rect x="40" y="855" width="720" height="96" rx="20" fill="#E8EDE1" stroke="#9CA986" stroke-width="1.5"/>
    <text x="70" y="915" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#4B5E39">Conjunto Completo:</text>
    <text x="450" y="918" font-family="system-ui, sans-serif" font-size="40" font-weight="900" fill="#2E3C21">Bs. 150.00</text>

    <!-- Divider -->
    <line x1="40" y1="975" x2="760" y2="975" stroke="#D1D5DB" stroke-width="1.5"/>

    <!-- Section: Características Destacadas -->
    <text x="40" y="1010" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#4B5E39" letter-spacing="1.5">CARACTERÍSTICAS DESTACADAS</text>

    <!-- Column 1 of Features -->
    <g transform="translate(40, 1030)">
      <g transform="translate(0, 0)">
        <circle cx="16" cy="14" r="11" fill="#9CA986"/>
        <text x="16" y="18" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
        <text x="36" y="19" font-family="system-ui, sans-serif" font-size="17" font-weight="600" fill="#1F2937">Tejido suave y agradable al tacto</text>
      </g>
      <g transform="translate(0, 42)">
        <circle cx="16" cy="14" r="11" fill="#9CA986"/>
        <text x="16" y="18" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
        <text x="36" y="19" font-family="system-ui, sans-serif" font-size="17" font-weight="600" fill="#1F2937">Diseño coordinado para recién nacido</text>
      </g>
      <g transform="translate(0, 84)">
        <circle cx="16" cy="14" r="11" fill="#9CA986"/>
        <text x="16" y="18" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
        <text x="36" y="19" font-family="system-ui, sans-serif" font-size="17" font-weight="600" fill="#1F2937">Acabados delicados y confort</text>
      </g>
      <g transform="translate(0, 126)">
        <circle cx="16" cy="14" r="11" fill="#9CA986"/>
        <text x="16" y="18" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
        <text x="36" y="19" font-family="system-ui, sans-serif" font-size="17" font-weight="600" fill="#1F2937">Conjunto completo (5 prendas)</text>
      </g>
    </g>

    <!-- Column 2 of Features -->
    <g transform="translate(420, 1030)">
      <g transform="translate(0, 0)">
        <circle cx="16" cy="14" r="11" fill="#9CA986"/>
        <text x="16" y="18" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
        <text x="36" y="19" font-family="system-ui, sans-serif" font-size="17" font-weight="600" fill="#1F2937">Detalles y confección cuidados</text>
      </g>
      <g transform="translate(0, 42)">
        <circle cx="16" cy="14" r="11" fill="#9CA986"/>
        <text x="16" y="18" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
        <text x="36" y="19" font-family="system-ui, sans-serif" font-size="17" font-weight="600" fill="#1F2937">Presentación ideal para regalo</text>
      </g>
      <g transform="translate(0, 84)">
        <circle cx="16" cy="14" r="11" fill="#9CA986"/>
        <text x="16" y="18" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">✓</text>
        <text x="36" y="19" font-family="system-ui, sans-serif" font-size="17" font-weight="600" fill="#1F2937">Fácil cuidado y lavado</text>
      </g>
    </g>

    <!-- Footer tagline -->
    <text x="40" y="1295" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="#7A8764">Identidad oficial SUAVECITO • Ropa de bebé tejida con amor</text>
  </svg>
  `;

  await sharp(Buffer.from(svgOverlay3))
    .composite([
      { input: logoBuffer, top: 12, left: 495 },
      { input: photo3Buffer, top: 104, left: 40 }
    ])
    .jpeg({ quality: 92 })
    .toFile(path.join(prodDir, 'diseno3.jpg'));

  console.log('Flyer C created successfully');

  // --- CATALOG COMPOSITE ---
  const catWidth = 2400;
  const catHeight = 1350;

  const f1Buf = await sharp(path.join(prodDir, 'diseno1.jpg')).toBuffer();
  const f2Buf = await sharp(path.join(prodDir, 'diseno2.jpg')).toBuffer();
  const f3Buf = await sharp(path.join(prodDir, 'diseno3.jpg')).toBuffer();

  await sharp({
    create: {
      width: catWidth,
      height: catHeight,
      channels: 4,
      background: { r: 247, g: 245, b: 240, alpha: 1 }
    }
  })
    .composite([
      { input: f1Buf, top: 0, left: 0 },
      { input: f2Buf, top: 0, left: 800 },
      { input: f3Buf, top: 0, left: 1600 }
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(prodDir, 'catalogo.jpg'));

  console.log('Catalogo composite created successfully');
}

createFlyers().catch(console.error);
