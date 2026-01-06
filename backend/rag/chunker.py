def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    """
    Découpe un texte en chunks avec chevauchement.
    - chunk_size : taille max d’un chunk (en caractères)
    - overlap : chevauchement entre chunks
    """
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap

    return chunks
