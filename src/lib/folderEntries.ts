// Recursively reads dropped folders via the WebKit DataTransferItem entry API,
// so a folder dragged onto the dropzone yields the same flat File[] as a
// regular multi-file selection.

interface FileSystemEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
}

interface FileSystemFileEntryLike extends FileSystemEntryLike {
  isFile: true;
  file: (success: (file: File) => void, error: (err: unknown) => void) => void;
}

interface FileSystemDirectoryEntryLike extends FileSystemEntryLike {
  isDirectory: true;
  createReader: () => {
    readEntries: (
      success: (entries: FileSystemEntryLike[]) => void,
      error: (err: unknown) => void
    ) => void;
  };
}

function readAllEntries(
  reader: ReturnType<FileSystemDirectoryEntryLike["createReader"]>
): Promise<FileSystemEntryLike[]> {
  return new Promise((resolve, reject) => {
    const all: FileSystemEntryLike[] = [];
    const readBatch = () => {
      reader.readEntries((entries) => {
        if (entries.length === 0) {
          resolve(all);
          return;
        }
        all.push(...entries);
        readBatch();
      }, reject);
    };
    readBatch();
  });
}

async function collectFiles(entry: FileSystemEntryLike): Promise<File[]> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntryLike;
    return new Promise((resolve) => {
      fileEntry.file(
        (file) => resolve([file]),
        () => resolve([])
      );
    });
  }

  if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntryLike;
    const entries = await readAllEntries(dirEntry.createReader());
    const nested = await Promise.all(entries.map(collectFiles));
    return nested.flat();
  }

  return [];
}

/**
 * Extracts all files from a drop event's DataTransferItemList, descending into
 * any dropped folders. Falls back to `null` when the browser doesn't support
 * the entry API, so callers can fall back to `dataTransfer.files` instead.
 */
export async function filesFromDataTransferItems(items: DataTransferItemList): Promise<File[] | null> {
  const entries: FileSystemEntryLike[] = [];
  for (const item of Array.from(items)) {
    const getAsEntry = (
      item as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntryLike | null }
    ).webkitGetAsEntry;
    if (typeof getAsEntry !== "function") return null;
    const entry = getAsEntry.call(item);
    if (entry) entries.push(entry);
  }

  const results = await Promise.all(entries.map(collectFiles));
  return results.flat();
}
