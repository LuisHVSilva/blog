import {ArticleDetailPage} from "./features/articles/pages/ArticleDetailPage";
import {ArticlesPage} from "./features/articles/pages/ArticlesPage";
import {ArticlesArchivePage} from "./features/articles/pages/ArticlesArchivePage";
import {CategoriesPage, ProjectsPage, SeriesPage} from "./features/site-demo/pages/SitePages";
import {I18nProvider} from "./i18n/I18nContext";
import {ThemeProvider} from "./theme/ThemeContext";

function resolvePage() {
    switch (window.location.pathname) {
        case "/article/nodejs-por-baixo-do-framework":
            return <ArticleDetailPage articleSlug="nodejs-por-baixo-do-framework"/>;
        case "/article/ts-config-explanation":
            return <ArticleDetailPage articleSlug="ts-config-explanation"/>;
        case "/article/js-ts-demystified":
            return <ArticleDetailPage articleSlug="js-ts-demystified"/>;
        case "/artigos":
            return <ArticlesArchivePage/>;
        case "/categories":
            return <CategoriesPage/>;
        case "/projects":
            return <ProjectsPage/>;
        case "/series":
            return <SeriesPage/>;
        default:
            return <ArticlesPage/>;
    }
}

function App() {
    return <ThemeProvider><I18nProvider>
        <div className="app-shell">{resolvePage()}</div>
    </I18nProvider></ThemeProvider>;
}

export default App;
