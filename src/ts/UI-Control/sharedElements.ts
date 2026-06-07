/*
KI generierte Methode
 */
export function nationalityToFlag(nationality: string): string {
     switch (nationality.trim().toLowerCase()) {
          case "american": return "🇺🇸";
          case "argentine":
          case "argentinian": return "🇦🇷";
          case "australian": return "🇦🇺";
          case "austrian": return "🇦🇹";
          case "belgian": return "🇧🇪";
          case "brazilian": return "🇧🇷";
          case "british": return "🇬🇧";
          case "canadian": return "🇨🇦";
          case "chilean": return "🇨🇱";
          case "chinese": return "🇨🇳";
          case "colombian": return "🇨🇴";
          case "czech": return "🇨🇿";
          case "danish": return "🇩🇰";
          case "dutch": return "🇳🇱";
          case "east german": return "🇩🇪";
          case "finnish": return "🇫🇮";
          case "french": return "🇫🇷";
          case "german": return "🇩🇪";
          case "hungarian": return "🇭🇺";
          case "indian": return "🇮🇳";
          case "indonesian": return "🇮🇩";
          case "irish": return "🇮🇪";
          case "italian": return "🇮🇹";
          case "japanese": return "🇯🇵";
          case "liechtensteiner": return "🇱🇮";
          case "malaysian": return "🇲🇾";
          case "mexican": return "🇲🇽";
          case "monegasque": return "🇲🇨";
          case "moroccan": return "🇲🇦";
          case "new zealander": return "🇳🇿";
          case "polish": return "🇵🇱";
          case "portuguese": return "🇵🇹";
          case "rhodesian": return "🇿🇼"; // modern equivalent
          case "russian": return "🇷🇺";
          case "south african": return "🇿🇦";
          case "spanish": return "🇪🇸";
          case "swedish": return "🇸🇪";
          case "swiss": return "🇨🇭";
          case "thai": return "🇹🇭";
          case "uruguayan": return "🇺🇾";
          case "venezuelan": return "🇻🇪";

         // constructors seen in Jolpica
          case "american-italian": return "🇺🇸🇮🇹";

          default:
               return "🏁";
     }
}