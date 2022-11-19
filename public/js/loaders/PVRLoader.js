( function () {

	/*
 *	 PVR v2 (legacy) parser
 *   TODO : Add Support for PVR v3 format
 *   TODO : implement loadMipmaps option
 */

	class PVRLoader extends THREE.CompressedTextureLoader {

		constructor( manager ) {

			super( manager );

		}

		parse( buffer, loadMipmaps ) {

			const headerLengthInt = 13;
			const header = new Uint32Array( buffer, 0, headerLengthInt );
			const pvrDatas = {
				buffer: buffer,
				header: header,
				loadMipmaps: loadMipmaps
			};

			if ( header[ 0 ] === 0x03525650 ) {

				// PVR v3
				return _parseV3( pvrDatas );

			} else if ( header[ 11 ] === 0x21525650 ) {

				// PVR v2
				return _parseV2( pvrDatas );

			} else {

				console.error( 'THREE.PVRLoader: Unknown PVR format.' );

			}

		}

	}

	function _parseV3( pvrDatas ) {

		const header = pvrDatas.header;
		let bpp, format;
		const metaLen = header[ 12 ];
			const pixelFormat = header[ 2 ];
			const height = header[ 6 ];
			const width = header[ 7 ];
			// numSurfs = header[ 9 ],
			const numFaces = header[ 10 ];
			const numMipmaps = header[ 11 ];

		switch ( pixelFormat ) {

			case 0:
				// PVRTC 2bpp RGB
				bpp = 2;
				format = THREE.RGB_PVRTC_2BPPV1_Format;
				break;

			case 1:
				// PVRTC 2bpp RGBA
				bpp = 2;
				format = THREE.RGBA_PVRTC_2BPPV1_Format;
				break;

			case 2:
				// PVRTC 4bpp RGB
				bpp = 4;
				format = THREE.RGB_PVRTC_4BPPV1_Format;
				break;

			case 3:
				// PVRTC 4bpp RGBA
				bpp = 4;
				format = THREE.RGBA_PVRTC_4BPPV1_Format;
				break;

			default:
				console.error( 'THREE.PVRLoader: Unsupported PVR format:', pixelFormat );

		}

		pvrDatas.dataPtr = 52 + metaLen;
		pvrDatas.bpp = bpp;
		pvrDatas.format = format;
		pvrDatas.width = width;
		pvrDatas.height = height;
		pvrDatas.numSurfaces = numFaces;
		pvrDatas.numMipmaps = numMipmaps;
		pvrDatas.isCubemap = numFaces === 6;
		return _extract( pvrDatas );

	}

	function _parseV2( pvrDatas ) {

		const header = pvrDatas.header;
		const headerLength = header[ 0 ];
			const height = header[ 1 ];
			const width = header[ 2 ];
			const numMipmaps = header[ 3 ];
			const flags = header[ 4 ];
			// dataLength = header[ 5 ],
			// bpp =  header[ 6 ],
			// bitmaskRed = header[ 7 ],
			// bitmaskGreen = header[ 8 ],
			// bitmaskBlue = header[ 9 ],
			const bitmaskAlpha = header[ 10 ];
			// pvrTag = header[ 11 ],
			const numSurfs = header[ 12 ];
		const TYPE_MASK = 0xff;
		const PVRTC_2 = 24;
			const PVRTC_4 = 25;
		const formatFlags = flags & TYPE_MASK;
		let bpp, format;

		const _hasAlpha = bitmaskAlpha > 0;

		if ( formatFlags === PVRTC_4 ) {

			format = _hasAlpha ? THREE.RGBA_PVRTC_4BPPV1_Format : THREE.RGB_PVRTC_4BPPV1_Format;
			bpp = 4;

		} else if ( formatFlags === PVRTC_2 ) {

			format = _hasAlpha ? THREE.RGBA_PVRTC_2BPPV1_Format : THREE.RGB_PVRTC_2BPPV1_Format;
			bpp = 2;

		} else {

			console.error( 'THREE.PVRLoader: Unknown PVR format:', formatFlags );

		}

		pvrDatas.dataPtr = headerLength;
		pvrDatas.bpp = bpp;
		pvrDatas.format = format;
		pvrDatas.width = width;
		pvrDatas.height = height;
		pvrDatas.numSurfaces = numSurfs;
		pvrDatas.numMipmaps = numMipmaps + 1; // guess cubemap type seems tricky in v2
		// it juste a pvr containing 6 surface (no explicit cubemap type)

		pvrDatas.isCubemap = numSurfs === 6;
		return _extract( pvrDatas );

	}

	function _extract( pvrDatas ) {

		const pvr = {
			mipmaps: [],
			width: pvrDatas.width,
			height: pvrDatas.height,
			format: pvrDatas.format,
			mipmapCount: pvrDatas.numMipmaps,
			isCubemap: pvrDatas.isCubemap
		};
		const buffer = pvrDatas.buffer;
		let dataOffset = pvrDatas.dataPtr;
			let dataSize = 0;
			let blockSize = 0;
			let blockWidth = 0;
			let blockHeight = 0;
			let widthBlocks = 0;
			let heightBlocks = 0;
		const bpp = pvrDatas.bpp;
			const numSurfs = pvrDatas.numSurfaces;

		if ( bpp === 2 ) {

			blockWidth = 8;
			blockHeight = 4;

		} else {

			blockWidth = 4;
			blockHeight = 4;

		}

		blockSize = blockWidth * blockHeight * bpp / 8;
		pvr.mipmaps.length = pvrDatas.numMipmaps * numSurfs;
		let mipLevel = 0;

		while ( mipLevel < pvrDatas.numMipmaps ) {

			const sWidth = pvrDatas.width >> mipLevel;
				const sHeight = pvrDatas.height >> mipLevel;
			widthBlocks = sWidth / blockWidth;
			heightBlocks = sHeight / blockHeight; // Clamp to minimum number of blocks

			if ( widthBlocks < 2 ) widthBlocks = 2;
			if ( heightBlocks < 2 ) heightBlocks = 2;
			dataSize = widthBlocks * heightBlocks * blockSize;

			for ( let surfIndex = 0; surfIndex < numSurfs; surfIndex ++ ) {

				const byteArray = new Uint8Array( buffer, dataOffset, dataSize );
				const mipmap = {
					data: byteArray,
					width: sWidth,
					height: sHeight
				};
				pvr.mipmaps[ surfIndex * pvrDatas.numMipmaps + mipLevel ] = mipmap;
				dataOffset += dataSize;

			}

			mipLevel ++;

		}

		return pvr;

	}

	THREE.PVRLoader = PVRLoader;

} )();
