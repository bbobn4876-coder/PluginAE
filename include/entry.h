#ifndef ENTRY_H
#define ENTRY_H

#ifdef AE_OS_WIN
    #define DllExport __declspec(dllexport)
#elif defined(AE_OS_MAC)
    #define DllExport __attribute__((visibility("default")))
#else
    #define DllExport
#endif

#endif // ENTRY_H
